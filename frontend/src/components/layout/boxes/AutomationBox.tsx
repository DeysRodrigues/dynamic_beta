import { useState, useEffect, useCallback } from "react";
import { 
  Zap, Plus, Trash2, Play, Volume2,
  AlertTriangle, X, Link as LinkIcon, Eraser, Download, 
  Music, Info, Clock, CheckSquare, Timer, MousePointerClick,
  Bell
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { getTodayDate } from "@/utils/DateUtils";

const SAFETY_FLOOR_MS = 1000;

type TriggerType = 'time' | 'tasks' | 'interval';
type ActionType = 'sound' | 'media' | 'notify' | 'alert' | 'theme' | 'link' | 'clear_done' | 'clear_all' | 'backup';

interface Rule {
  id: string;
  name: string;
  trigger: TriggerType;
  triggerValue: string;
  action: ActionType;
  actionValue: string;
  lastRun?: number;
  active: boolean;
}

// Constantes
const SOUNDS = {
  alarm: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
};

const TRIGGER_DESC = {
  time: "Dispara uma vez por dia no horário exato.",
  tasks: "Dispara quando você atingir a meta de tarefas feitas.",
  interval: "Repete ciclicamente (ex: beber água a cada 60min)."
};

const ACTION_DESC = {
  media: "Toca um vídeo/áudio do YouTube ou SoundCloud (bom para alarmes).",
  sound: "Toca um efeito sonoro curto e simples.",
  notify: "Envia uma notificação do navegador.",
  alert: "Abre um alerta pop-up na tela.",
  theme: "Inverte as cores do site.",
  link: "Abre um site em uma nova aba.",
  clear_done: "Remove tarefas concluídas.",
  clear_all: "Reseta a lista inteira.",
  backup: "Baixa backup .json."
};

// --- FUNÇÃO AUXILIAR PARA EMBED ---
const getEmbedUrl = (url: string) => {
  if (!url) return "";
  try {
    let videoId = "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
      else if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0];
      
      // Retorna URL de embed com autoplay ligado e sem controles
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`;
    }
    return url; 
  } catch {
    return url;
  }
};

// Formata milissegundos em texto (ex: "02:30" ou "1h 20m")
const formatDuration = (ms: number) => {
  if (ms <= 0) return "00:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function AutomationBox({ id = "auto-default" }: { id?: string }) {
  // Importando 'tasks' para usar no cálculo visual da regra de tarefas
  const { tasks, removeTasks, deleteAllTasks } = useTaskStore();
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const saved = getBoxContent(id);

  const [rules, setRules] = useState<Rule[]>(saved.rules || []);
  const [isAdding, setIsAdding] = useState(false);
  
  // Estado para forçar re-render a cada segundo (Clock Visual)
  const [, setTicker] = useState(0);
  
  const [newTrigger, setNewTrigger] = useState<TriggerType>('time');
  const [newTriggerVal, setNewTriggerVal] = useState("");
  const [newAction, setNewAction] = useState<ActionType>('sound');
  const [newActionVal, setNewActionVal] = useState("bell");

  const [alarmUrl, setAlarmUrl] = useState("");
  const [isPlayingAlarm, setIsPlayingAlarm] = useState(false);

  useEffect(() => {
    setBoxContent(id, { rules });
  }, [rules, id, setBoxContent]);

  // Efeito de Relógio para atualizar contadores visuais
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const executeAction = useCallback((rule: Rule) => {
    if (rule.action === 'media') { 
      setAlarmUrl(rule.actionValue); 
      setIsPlayingAlarm(true); 
    }
    if (rule.action === 'sound') {
      const audioUrl = SOUNDS[rule.actionValue as keyof typeof SOUNDS];
      if (audioUrl) new Audio(audioUrl).play().catch(() => {});
    }
    if (rule.action === 'notify' && Notification.permission === "granted") {
      new Notification(rule.name);
    }
    if (rule.action === 'alert') {
      setTimeout(() => alert(`🤖 ${rule.name}`), 100);
    }
  
    if (rule.action === 'link') {
      window.open(rule.actionValue, '_blank');
    }
    if (rule.action === 'clear_done') {
      const currentTasks = useTaskStore.getState().tasks;
      const doneIds = currentTasks.filter(t => t.completed).map(t => t.id);
      if (doneIds.length > 0) removeTasks(doneIds);
    }
    if (rule.action === 'clear_all') {
      const currentTasks = useTaskStore.getState().tasks;
      if (currentTasks.length > 0) deleteAllTasks();
    }
    if (rule.action === 'backup') {
      const currentTasks = useTaskStore.getState().tasks;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTasks));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `backup-${getTodayDate()}.json`;
      a.click();
    }
  }, [removeTasks, deleteAllTasks]); 

  // --- MOTOR LÓGICO ---
  useEffect(() => {
    const checkRules = () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const today = getTodayDate();
      
      const currentTasks = useTaskStore.getState().tasks;
      const completedToday = currentTasks.filter(t => t.date === today && t.completed).length;

      setRules(currentRules => {
        let hasChanges = false;
        const updatedRules = currentRules.map(rule => {
          if (!rule.active) return rule;
          const lastRun = rule.lastRun || 0;
          const timeSinceRun = Date.now() - lastRun;
          
          // Prevenção de disparos múltiplos muito rápidos (debounce de 1s)
          if (timeSinceRun < SAFETY_FLOOR_MS) return rule;

          let shouldRun = false;
          
          // Lógica de Tempo: Dispara se for o minuto exato e não tiver rodado no último minuto
          if (rule.trigger === 'time' && rule.triggerValue === timeStr && timeSinceRun > 60000) {
            shouldRun = true;
          }
          
          // Lógica de Tasks: Dispara se atingiu o alvo e não disparou recentemente
          if (rule.trigger === 'tasks') {
            const target = parseInt(rule.triggerValue);
            if (target > 0 && completedToday === target && timeSinceRun > 60000) {
              shouldRun = true;
            }
          }
          
          // Lógica de Intervalo: Dispara se passou o tempo
          if (rule.trigger === 'interval') {
            let seconds = parseFloat(rule.triggerValue);
            if (isNaN(seconds)) seconds = 60;
            const safeInterval = Math.max(seconds * 1000, SAFETY_FLOOR_MS);
            if (timeSinceRun > safeInterval) {
              shouldRun = true;
            }
          }

          if (shouldRun) {
            executeAction(rule);
            hasChanges = true;
            return { ...rule, lastRun: Date.now() };
          }
          return rule;
        });
        return hasChanges ? updatedRules : currentRules;
      });
    };
    
    const interval = setInterval(checkRules, 1000);
    return () => clearInterval(interval);
  }, [executeAction]); 

  // --- CÁLCULO DE STATUS VISUAL ---
  const getRuleStatus = (rule: Rule) => {
    if (!rule.active) return "Inativo";

    if (rule.trigger === 'time') {
      const [h, m] = rule.triggerValue.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      // Se já passou hoje, alvo é amanhã
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      return formatDuration(diff);
    }

    if (rule.trigger === 'interval') {
      // Se nunca rodou, está pronto
      if (!rule.lastRun) return "Pronto";
      const intervalMs = parseFloat(rule.triggerValue) * 1000;
      const nextRun = rule.lastRun + intervalMs;
      const diff = nextRun - Date.now();
      
      if (diff <= 0) return "Pronto";
      return formatDuration(diff);
    }

    if (rule.trigger === 'tasks') {
      const today = getTodayDate();
      const completed = tasks.filter(t => t.date === today && t.completed).length;
      const target = parseInt(rule.triggerValue);
      const remaining = Math.max(0, target - completed);
      return remaining === 0 ? "Feito!" : `Faltam ${remaining}`;
    }

    return "";
  };

  const addRule = () => {
    if (!newTriggerVal) return alert("Preencha o valor do gatilho.");
    if ((newAction === 'link' || newAction === 'media') && !newActionVal) return alert("Cole a URL.");

    const triggerName = newTrigger === 'time' ? `Às ${newTriggerVal}` : newTrigger === 'tasks' ? `${newTriggerVal} Tasks` : `${newTriggerVal}s`;
    const actionLabels: Record<ActionType, string> = {
      sound: 'Tocar Som', media: 'Tocar Mídia', notify: 'Notificar', alert: 'Alerta',
      theme: 'Mudar Tema', link: 'Link', clear_done: 'Limpar Feitas', clear_all: 'Resetar', backup: 'Backup'
    };
    
    const newRule: Rule = {
      id: crypto.randomUUID(),
      name: `${triggerName} → ${actionLabels[newAction]}`,
      trigger: newTrigger,
      triggerValue: newTriggerVal,
      action: newAction,
      actionValue: newActionVal,
      active: true,
      lastRun: 0
    };

    setRules([...rules, newRule]);
    setIsAdding(false);
    setNewTriggerVal("");
    setNewActionVal("");
  };

  const deleteRule = (id: string) => { setRules(rules.filter(r => r.id !== id)); };

  return (
    <div className="box-padrao flex flex-col p-0 relative overflow-hidden">
      
      {/* --- PLAYER NATIVO (IFRAME) --- */}
      {isPlayingAlarm && alarmUrl && (
        <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none -z-10">
          <iframe
            width="100%" 
            height="100%" 
            src={getEmbedUrl(alarmUrl)} 
            title="Alarm Player"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {isPlayingAlarm && (
        <div className="bg-primary p-2 flex justify-between items-center animate-pulse z-30">
          <span className="text-xs font-bold text-primary-foreground flex items-center gap-2">
            <Music size={14}/> Reproduzindo...
          </span>
          <button onClick={() => setIsPlayingAlarm(false)} className="bg-primary-foreground text-primary px-2 py-0.5 rounded text-[10px] font-bold">PARAR</button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-current/10">
        <h2 className="font-bold flex items-center gap-2">
          <Zap size={18}/> Automações
        </h2>
        <button onClick={() => setIsAdding(true)} className="bg-primary hover:opacity-90 text-primary-foreground p-1.5 rounded-lg transition"><Plus size={16} /></button>
      </div>

      {/* Lista de Regras */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 text-xs gap-2 text-center px-4">
            <Zap size={24} className="opacity-20"/>
            <p>Seus gatilhos aparecerão aqui.</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between bg-current/5 p-3 rounded-xl border border-current/10">
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="font-medium text-xs truncate">{rule.name}</span>
                {/* Contagem Regressiva / Status */}
                <span className="text-[10px] font-mono opacity-60 flex items-center gap-1">
                  {rule.trigger === 'time' && <Clock size={10} />}
                  {rule.trigger === 'interval' && <Timer size={10} />}
                  {rule.trigger === 'tasks' && <CheckSquare size={10} />}
                  {getRuleStatus(rule)}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                 <button onClick={() => executeAction(rule)} className="opacity-60 hover:opacity-100 hover:text-green-500" title="Testar"><Play size={12}/></button>
                 <button onClick={() => deleteRule(rule.id)} className="opacity-60 hover:opacity-100 hover:text-red-500" title="Excluir"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- WIZARD DE CRIAÇÃO --- */}
      {isAdding && (
        <div className="absolute inset-0 z-20 flex flex-col animate-in slide-in-from-bottom-10 overflow-y-auto custom-scrollbar backdrop-blur-xl" 
             style={{ backgroundColor: 'var(--box-color)', color: 'var(--box-text-color)' }}>
          
          <div className="sticky top-0 p-4 border-b border-current/10 flex justify-between items-center z-10 bg-inherit">
            <h3 className="font-bold text-sm">Criar Automação</h3>
            <button onClick={() => setIsAdding(false)}><X size={18} className="opacity-60 hover:opacity-100"/></button>
          </div>

          <div className="p-4 space-y-6">
            
            {/* 1. SE... */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <MousePointerClick size={14}/> 1. Quando...
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'time', icon: <Clock size={16}/>, label: 'Horário' },
                  { id: 'tasks', icon: <CheckSquare size={16}/>, label: 'Meta' },
                  { id: 'interval', icon: <Timer size={16}/>, label: 'Ciclo' },
                ].map(t => (
                  <button key={t.id} onClick={() => setNewTrigger(t.id as TriggerType)} 
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs transition-all ${newTrigger === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-current/5 border-transparent opacity-60 hover:opacity-100'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-[10px] text-primary flex gap-2 items-start">
                <Info size={12} className="mt-0.5 shrink-0"/> {TRIGGER_DESC[newTrigger]}
              </div>

              <div className="bg-current/5 p-2 rounded-lg border border-current/10">
                {newTrigger === 'time' && <input type="time" className="w-full bg-transparent outline-none text-sm text-center" value={newTriggerVal} onChange={e => setNewTriggerVal(e.target.value)} />}
                {newTrigger === 'tasks' && <input type="number" placeholder="Quantas tasks?" className="w-full bg-transparent outline-none text-sm" value={newTriggerVal} onChange={e => setNewTriggerVal(e.target.value)} />}
                {newTrigger === 'interval' && <input type="number" placeholder="Segundos" className="w-full bg-transparent outline-none text-sm" value={newTriggerVal} onChange={e => setNewTriggerVal(e.target.value)} />}
              </div>
            </div>

            {/* 2. ENTÃO... */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
                <Zap size={14}/> 2. Fazer...
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'sound', icon: <Volume2 size={14}/>, label: 'Som' },
                  { id: 'media', icon: <Music size={14}/>, label: 'Mídia' },
                  { id: 'notify', icon: <Bell size={14}/>, label: 'Notif' },
                  { id: 'alert', icon: <AlertTriangle size={14}/>, label: 'Alerta' },
                  { id: 'link', icon: <LinkIcon size={14}/>, label: 'Link' },
                  { id: 'clear_done', icon: <Eraser size={14}/>, label: 'Limpar' },
                  { id: 'backup', icon: <Download size={14}/>, label: 'Salvar' },
                ].map(a => (
                  <button key={a.id} onClick={() => setNewAction(a.id as ActionType)} 
                    className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 text-[9px] transition-all h-14 ${newAction === a.id ? 'bg-green-600 text-white border-green-500' : 'bg-current/5 border-transparent opacity-60 hover:opacity-100'}`}>
                    {a.icon} <span className="truncate w-full text-center">{a.label}</span>
                  </button>
                ))}
              </div>

              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-[10px] text-green-600 flex gap-2 items-start">
                <Info size={12} className="mt-0.5 shrink-0"/> {ACTION_DESC[newAction]}
              </div>

              {(newAction === 'media' || newAction === 'link' || newAction === 'sound') && (
                <div className="bg-current/5 p-2 rounded-lg border border-current/10">
                  {newAction === 'media' && <input type="text" placeholder="YouTube/SoundCloud URL" className="w-full bg-transparent outline-none text-xs" value={newActionVal} onChange={e => setNewActionVal(e.target.value)} />}
                  {newAction === 'link' && <input type="text" placeholder="https://..." className="w-full bg-transparent outline-none text-xs" value={newActionVal} onChange={e => setNewActionVal(e.target.value)} />}
                  {newAction === 'sound' && (
                    <select className="w-full bg-transparent text-xs outline-none" value={newActionVal} onChange={e => setNewActionVal(e.target.value)}>
                      <option value="alarm">Alarme</option>
        
                    </select>
                  )}
                </div>
              )}
            </div>

            <button onClick={addRule} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg mt-4">
              Confirmar Automação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}