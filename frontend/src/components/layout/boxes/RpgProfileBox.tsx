import { useState, useEffect, useMemo } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { 
  User, Shield, Sword, Trophy, Crown,
  Edit2, Save, X, Plus, Trash2, BookOpen, Timer, CheckSquare
} from "lucide-react";

// --- TIPOS ---
interface CustomAction {
  id: string;
  label: string;
  xp: number;
}

interface XpRules {
  task: number;
  book: number;
  pomodoro: number;
}

interface RpgData {
  name: string;
  customTitle: string;
  themeColor: string;
  rules: XpRules;
  customActions: CustomAction[];
  manualXp: number;
}

export default function RpgProfileBox({ id = "rpg-default" }: { id?: string }) {
  const { tasks } = useTaskStore();
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const { boxes } = useDashboardStore();
  
  const saved = getBoxContent(id);

  // --- ESTADOS ---
  const [data, setData] = useState<RpgData>({
    name: saved.name || "Player 1",
    customTitle: saved.customTitle || "",
    themeColor: saved.themeColor || "stone", // Agora define a cor de destaque, não o fundo
    rules: saved.rules || { task: 10, book: 100, pomodoro: 25 },
    customActions: saved.customActions || [],
    manualXp: saved.manualXp || 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<'profile' | 'rules'>('profile');
  
  const [newActionLabel, setNewActionLabel] = useState("");
  const [newActionXp, setNewActionXp] = useState("10");

  useEffect(() => {
    setBoxContent(id, data);
  }, [data, id, setBoxContent]);

  // --- CÁLCULO DE XP ---
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedBooks = useMemo(() => {
    const libIds = boxes.filter(bid => bid.startsWith("library"));
    let count = 0;
    libIds.forEach(libId => {
      const content = getBoxContent(libId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (content?.books) count += content.books.filter((b: any) => b.completed).length;
    });
    return count;
  }, [boxes, getBoxContent]);

  const [pomodoros, setPomodoros] = useState(0);
  useEffect(() => {
    const checkPomo = () => {
      const savedPomo = localStorage.getItem("pomodoro-counts");
      if (savedPomo) setPomodoros(JSON.parse(savedPomo).work || 0);
    };
    checkPomo();
    const interval = setInterval(checkPomo, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalXp = (completedTasks * data.rules.task) + (completedBooks * data.rules.book) + (pomodoros * data.rules.pomodoro) + data.manualXp;
  const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
  const xpForCurrentLevel = (level - 1) * (level - 1) * 100;
  const xpForNextLevel = (level * level) * 100;
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

  const getAutoClass = (lvl: number) => {
    if (lvl < 5) return { title: "Aventureiro", icon: <User size={24}/> };
    if (lvl < 15) return { title: "Guerreiro", icon: <Shield size={24}/> };
    if (lvl < 30) return { title: "Veterano", icon: <Sword size={24}/> };
    if (lvl < 60) return { title: "Mestre", icon: <Trophy size={24}/> };
    return { title: "Lenda", icon: <Crown size={24}/> };
  };
  const autoClass = getAutoClass(level);

  const addCustomAction = () => {
    if (!newActionLabel || !newActionXp) return;
    const newAction: CustomAction = { id: crypto.randomUUID(), label: newActionLabel, xp: parseInt(newActionXp) };
    setData({ ...data, customActions: [...data.customActions, newAction] });
    setNewActionLabel(""); setNewActionXp("10");
  };

  const removeCustomAction = (actId: string) => {
    setData({ ...data, customActions: data.customActions.filter(a => a.id !== actId) });
  };

  const triggerCustomAction = (xp: number) => {
    setData(prev => ({ ...prev, manualXp: prev.manualXp + xp }));
  };

  // Cores de Destaque (Accent) para cada tema
  const accentColors: Record<string, string> = {
    stone: "#78716c", red: "#ef4444", blue: "#3b82f6", 
    purple: "#a855f7", amber: "#f59e0b", emerald: "#10b981",
  };
  const currentAccent = accentColors[data.themeColor] || accentColors.stone;

  return (
    // Box padrão sem gradiente de fundo, mantendo transparência
    <div className="box-padrao relative group overflow-hidden flex flex-col">
      
      {!isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/5 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          <Edit2 size={14} />
        </button>
      )}

      {isEditing ? (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 p-4 flex flex-col animate-in fade-in overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4 pb-2">
            <div className="flex gap-2">
              <button onClick={() => setEditTab('profile')} className={`text-xs font-bold px-2 py-1 rounded ${editTab === 'profile' ? 'bg-primary/10 text-primary' : 'opacity-60'}`}>PERFIL</button>
              <button onClick={() => setEditTab('rules')} className={`text-xs font-bold px-2 py-1 rounded ${editTab === 'rules' ? 'bg-primary/10 text-primary' : 'opacity-60'}`}>REGRAS</button>
            </div>
            <button onClick={() => setIsEditing(false)}><X size={18} className="hover:text-red-500"/></button>
          </div>

          {editTab === 'profile' && (
            <div className="space-y-3">
              <div><label className="text-[10px] font-bold opacity-60 uppercase">Nome</label><input className="w-full bg-transparent text-sm font-bold outline-none" value={data.name} onChange={e => setData({...data, name: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold opacity-60 uppercase">Título Custom</label><input className="w-full bg-transparent text-sm outline-none" placeholder={autoClass.title} value={data.customTitle} onChange={e => setData({...data, customTitle: e.target.value})} /></div>
              <div>
                <label className="text-[10px] font-bold opacity-60 uppercase mb-1 block">Cor da Aura</label>
                <div className="flex gap-2">
                  {Object.entries(accentColors).map(([key, color]) => (
                    <button key={key} onClick={() => setData({...data, themeColor: key})} className={`w-5 h-5 rounded-full ${data.themeColor === key ? 'ring-2 ring-offset-1 ring-primary' : ''}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {editTab === 'rules' && (
            <div className="space-y-4">
              <div className="bg-black/5 p-2 rounded-lg space-y-2">
                <p className="text-[10px] font-bold opacity-60 uppercase">Valores de XP</p>
                <div className="flex items-center justify-between text-xs"><span className="flex gap-1 items-center"><CheckSquare size={12}/> Task</span><input type="number" className="w-12 text-center rounded bg-transparent" value={data.rules.task} onChange={e => setData({...data, rules: {...data.rules, task: Number(e.target.value)}})} /></div>
                <div className="flex items-center justify-between text-xs"><span className="flex gap-1 items-center"><BookOpen size={12}/> Livro</span><input type="number" className="w-12 text-center rounded bg-transparent" value={data.rules.book} onChange={e => setData({...data, rules: {...data.rules, book: Number(e.target.value)}})} /></div>
                <div className="flex items-center justify-between text-xs"><span className="flex gap-1 items-center"><Timer size={12}/> Pomo</span><input type="number" className="w-12 text-center rounded bg-transparent" value={data.rules.pomodoro} onChange={e => setData({...data, rules: {...data.rules, pomodoro: Number(e.target.value)}})} /></div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold opacity-60 uppercase">Ações Manuais</p>
                <div className="flex gap-1"><input placeholder="Ex: Academia" className="flex-1 bg-transparent text-xs outline-none" value={newActionLabel} onChange={e => setNewActionLabel(e.target.value)} /><input type="number" placeholder="XP" className="w-10 bg-transparent text-xs outline-none" value={newActionXp} onChange={e => setNewActionXp(e.target.value)} /><button onClick={addCustomAction} className="text-primary"><Plus size={16}/></button></div>
                <div className="max-h-24 overflow-y-auto space-y-1">{data.customActions.map(act => (<div key={act.id} className="flex justify-between items-center text-xs bg-black/5 p-1.5 rounded"><span>{act.label} (+{act.xp})</span><button onClick={() => removeCustomAction(act.id)} className="text-red-500 opacity-60 hover:opacity-100"><Trash2 size={12}/></button></div>))}</div>
              </div>
            </div>
          )}
          <button onClick={() => setIsEditing(false)} className="mt-auto w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90"><Save size={14} /> SALVAR</button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          
          {/* TOPO: PERFIL */}
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar com Borda na Cor do Tema */}
            <div 
              className="w-12 h-12 bg-current/5 backdrop-blur-sm rounded-xl ring-2 flex items-center justify-center shadow-sm"
              style={{ borderColor: currentAccent, color: currentAccent }}
            >
              {autoClass.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-lg leading-tight truncate">{data.name}</h2>
              <p className="text-xs font-bold uppercase opacity-60 tracking-wider truncate" style={{ color: currentAccent }}>
                Lv.{level} {data.customTitle || autoClass.title}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold opacity-50 block">XP TOTAL</span>
              <span className="text-sm font-mono font-bold">{totalXp.toLocaleString()}</span>
            </div>
          </div>

          {/* BARRA XP */}
          <div className="w-full mb-3">
            <div className="flex justify-between text-[9px] font-bold mb-1 opacity-70 px-1">
              <span>{Math.floor(xpInLevel)} XP</span>
              <span>{Math.floor(xpNeeded)} PROX.</span>
            </div>
            <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                style={{ width: `${progressPercent}%`, backgroundColor: currentAccent }}
              />
            </div>
          </div>

          {/* GRID DE AÇÕES */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="flex gap-2 mb-2">
               <div className="flex-1 bg-current/5 rounded p-1 text-center" title="Tarefas"><CheckSquare size={12} className="mx-auto mb-0.5 opacity-60"/><span className="text-xs font-bold">{completedTasks}</span></div>
               <div className="flex-1 bg-current/5 rounded p-1 text-center" title="Livros"><BookOpen size={12} className="mx-auto mb-0.5 opacity-60"/><span className="text-xs font-bold">{completedBooks}</span></div>
               <div className="flex-1 bg-current/5 rounded p-1 text-center" title="Pomodoros"><Timer size={12} className="mx-auto mb-0.5 opacity-60"/><span className="text-xs font-bold">{pomodoros}</span></div>
            </div>

            {data.customActions.length > 0 && (
              <div className="space-y-1">
                <p className="text-[9px] font-bold opacity-50 uppercase pl-1">Quests</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {data.customActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => triggerCustomAction(action.xp)}
                      className="bg-current/5 hover:bg-current/10 active:scale-95 transition text-left px-2 py-1.5 rounded flex justify-between items-center group"
                    >
                      <span className="text-[10px] font-medium truncate">{action.label}</span>
                      <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100" style={{ color: currentAccent }}>+{action.xp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}