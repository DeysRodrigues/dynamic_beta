import { useState } from "react";
import { X, Download, Upload, Database, AlertTriangle, } from "lucide-react";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// Lista de TODAS as chaves que o app usa para salvar dados
const APP_KEYS = [
  // Chaves definidas em constants
  STORAGE_KEYS.DASHBOARD,
  STORAGE_KEYS.TASKS,
  STORAGE_KEYS.GOALS,
  STORAGE_KEYS.TAGS,
  STORAGE_KEYS.POMODORO,
  STORAGE_KEYS.GOAL_HOURS,
  
  // Chaves definidas hardcoded nos stores
  "layout-templates-storage",
  "box-content-storage",
  "custom-widgets-storage",
  "weeks-storage",
  "notification-storage",
  "theme-storage",
  "pomodoro-global-storage", // Do novo sistema global
  
  // Chaves diretas de widgets
  "pomodoro-counts",
  "w-water-cups"
];

interface GeneralBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneralBackupModal({ isOpen, onClose }: GeneralBackupModalProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  if (!isOpen) return null;

  // --- FUNÇÃO DE EXPORTAR (BACKUP) ---
  const handleExport = () => {
    try {
      const backupData: Record<string, any> = {};
      
      // 1. Coleta dados do LocalStorage
      APP_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            backupData[key] = JSON.parse(item);
          } catch (e) {
            // Se não for JSON (ex: string pura), salva como está
            backupData[key] = item;
          }
        }
      });

      // 2. Metadados do Backup
      const finalPayload = {
        meta: {
          app: "Dynamic Notes",
          version: "0.5.0",
          date: new Date().toISOString(),
        },
        data: backupData
      };

      // 3. Gera arquivo para download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalPayload));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `dynamic-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

    } catch (error) {
      console.error("Erro ao criar backup:", error);
      alert("Falha ao gerar o arquivo de backup.");
    }
  };

  // --- FUNÇÃO DE IMPORTAR (RESTAURAR) ---
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("⚠️ ATENÇÃO: Restaurar um backup irá SUBSTITUIR todos os seus dados atuais. Essa ação é irreversível. Deseja continuar?")) {
      e.target.value = ""; // Limpa o input
      return;
    }

    setIsRestoring(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === "string") {
          const parsed = JSON.parse(content);

          // Validação básica
          if (!parsed.meta || parsed.meta.app !== "Dynamic Notes" || !parsed.data) {
            throw new Error("Arquivo inválido ou de outro aplicativo.");
          }

          // Limpa e Restaura
          // Opcional: localStorage.clear(); // Se quiser limpar tudo antes (perigoso se tiver outras coisas no localhost)
          
          Object.entries(parsed.data).forEach(([key, value]) => {
            if (typeof value === 'object') {
              localStorage.setItem(key, JSON.stringify(value));
            } else {
              localStorage.setItem(key, String(value));
            }
          });

          alert("Backup restaurado com sucesso! A página será recarregada.");
          window.location.reload(); // Força recarregar para os Stores pegarem os novos dados
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler o arquivo de backup. Verifique se é um .json válido gerado por este app.");
        setIsRestoring(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{ color: '#f4f4f5' }}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Database className="text-purple-500" /> Backup & Restauração
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Card Exportar */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-purple-500/50 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Criar Backup Completo</h3>
                <p className="text-xs text-white/50 mb-3">Salva todas as suas tarefas, widgets, temas e configurações em um arquivo seguro no seu computador.</p>
                <button 
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold w-full transition shadow-lg shadow-purple-500/20"
                >
                  BAIXAR ARQUIVO .JSON
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#18181b] px-2 text-white/30">Zona de Perigo</span></div>
          </div>

          {/* Card Importar */}
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 hover:border-red-500/30 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1 text-red-100">Restaurar Dados</h3>
                <p className="text-xs text-red-200/50 mb-3">Carrega um arquivo de backup anterior. <br/><span className="text-red-400 font-bold flex items-center gap-1 mt-1"><AlertTriangle size={10}/> Cuidado: Isso apaga os dados atuais!</span></p>
                
                <label className={`bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-xs font-bold w-full transition flex items-center justify-center gap-2 cursor-pointer ${isRestoring ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isRestoring ? "Restaurando..." : "SELECIONAR ARQUIVO"}
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={isRestoring} />
                </label>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 bg-black/20 text-center border-t border-white/5">
          <p className="text-[10px] text-white/30">O backup não inclui imagens customizadas (apenas o link/base64 se for pequeno).</p>
        </div>

      </div>
    </div>
  );
}