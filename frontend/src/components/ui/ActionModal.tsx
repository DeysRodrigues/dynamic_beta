import { X, Info } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function ActionModal({ 
  isOpen, 
  onClose, 
  title = "Em Construção", 
  message = "Ainda estamos desenvolvendo isso, humano! Aguarde as próximas atualizações." 
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6 overflow-hidden group"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
          <Info size={32} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-sm text-white/50 leading-relaxed italic">
            "{message}"
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
        >
          Entendido
        </button>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
