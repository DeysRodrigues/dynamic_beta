import { useState, useEffect } from "react";
import { Clock, Calendar, Edit2 } from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { cn } from "@/lib/utils";

interface CountdownBoxProps {
  id?: string;
}

export default function CountdownBox({ id = "countdown-default" }: CountdownBoxProps) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const saved = getBoxContent(id);

  const [eventName, setEventName] = useState(saved.eventName || "Próximo Evento");
  // Data padrão: Amanhã no mesmo horário, caso não tenha nada salvo
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  const [targetDate, setTargetDate] = useState(saved.targetDate || defaultDate.toISOString().slice(0, 16));
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setBoxContent(id, { eventName, targetDate });
  }, [eventName, targetDate, id, setBoxContent]);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      } else {
        setIsExpired(false);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Componente auxiliar para cada bloco de tempo
  const TimeBlock = ({ value, label, primary = false }: { value: number, label: string, primary?: boolean }) => (
    <div className="flex flex-col items-center justify-end">
      <span className={cn(
        "font-mono leading-none mb-1 transition-all",
        // Se for primário (segundos), usa a cor de destaque e fica maior
        primary ? "text-3xl sm:text-4xl font-black text-primary tabular-nums" : "text-2xl sm:text-3xl font-bold tabular-nums opacity-90",
        // Se expirado, fica tudo cinza
        isExpired && !primary && "opacity-40",
        isExpired && primary && "text-current opacity-40"
      )}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-50">{label}</span>
    </div>
  );

  return (
    <div className="box-padrao flex flex-col relative group overflow-hidden p-0">
      
      {/* --- HEADER (Visível apenas ao passar o mouse ou editando) --- */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-3 bg-current/10 backdrop-blur-md z-20 transition-all duration-300 border-b border-current/10 flex flex-col gap-2",
        isEditing || !targetDate ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
      )}>
          <input
            type="text"
            className="font-bold bg-transparent border-b border-current/20 outline-none w-full placeholder:opacity-50 text-sm pb-1 text-inherit"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Nome do Evento..."
          />
          <div className="flex items-center gap-2 text-xs opacity-70">
             <Calendar size={14} />
             <input 
               type="datetime-local" 
               className="bg-transparent outline-none cursor-pointer p-0 border-none text-inherit w-full font-medium"
               value={targetDate}
               onChange={(e) => setTargetDate(e.target.value)}
             />
          </div>
          <button onClick={() => setIsEditing(false)} className="self-end text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold mt-1">OK</button>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-8 relative">
        {/* Botão de Editar Rápido */}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="absolute top-3 right-3 p-1.5 rounded-full bg-current/5 hover:bg-current/10 opacity-0 group-hover:opacity-100 transition text-xs">
            <Edit2 size={14} />
          </button>
        )}

        {/* Título do Evento */}
        <h2 className="text-center font-bold text-lg sm:text-xl mb-6 truncate w-full px-4 opacity-90">
          {isExpired ? `${eventName} chegou!` : eventName}
        </h2>
        
        {/* O DISPLAY DO TIMER */}
        <div className="flex items-end justify-center gap-3 sm:gap-5 w-full">
           <TimeBlock value={timeLeft.days} label="Dias" />
           <TimeBlock value={timeLeft.hours} label="Hrs" />
           <TimeBlock value={timeLeft.minutes} label="Min" />
           {/* Segundos com destaque */}
           <div className="pb-0.5 pl-1">
             <TimeBlock value={timeLeft.seconds} label="Seg" primary />
           </div>
        </div>
      </div>

      {/* --- FOOTER: DATA ALVO --- */}
      {targetDate && !isExpired && (
         <div className="text-center text-[10px] sm:text-xs opacity-50 py-3 border-t border-current/5 bg-current/5 flex items-center justify-center gap-2 font-medium uppercase tracking-wider">
            <Clock size={12} className="text-primary animate-pulse"/>
            {new Date(targetDate).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
         </div>
      )}
      {isExpired && (
         <div className="text-center text-xs font-bold py-3 border-t border-current/5 bg-primary/10 text-primary flex items-center justify-center gap-2 uppercase tracking-wider">
            Evento Finalizado
         </div>
      )}
    </div>
  );
}