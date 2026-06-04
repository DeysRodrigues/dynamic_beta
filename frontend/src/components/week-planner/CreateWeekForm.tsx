import { Layout, Check, ChevronRight } from "lucide-react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";

interface CreateWeekFormProps {
  name: string;
  setName: (name: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  tags: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateWeekForm({
  name, setName,
  startDate, setStartDate,
  endDate, setEndDate,
  selectedTag, setSelectedTag,
  tags,
  onSubmit,
  onCancel
}: CreateWeekFormProps) {
  return (
    <div className="box-padrao border-none animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden p-0">
      <div className="p-8 pb-4">
        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 mb-1">
          <Layout size={20} className="text-primary" /> Iniciar Novo Ciclo
        </h3>
        <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">Crie um escopo temporal para suas tarefas</p>
      </div>

      <div className="p-8 pt-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Identificação</label>
              <input
                type="text"
                placeholder="Ex: Sprint #01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 text-sm font-bold rounded-2xl bg-current/[0.06] border-none focus:bg-current/[0.1] outline-none transition-all text-current placeholder:opacity-20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Tagzona Alvo</label>
              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-5 py-4 text-sm font-bold uppercase tracking-widest bg-current/[0.06] border-none focus:bg-current/[0.1] outline-none transition-all rounded-2xl appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[var(--box-color)]">Selecione uma Tag...</option>
                  {tags.map((t) => (
                    <option key={t} value={t} className="bg-[var(--box-color)]">{t}</option>
                  ))}
                </select>
                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 opacity-30 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomDatePicker 
              label="Início do Ciclo"
              value={startDate}
              onChange={setStartDate}
            />
            
            <CustomDatePicker 
              label="Fim do Ciclo"
              value={endDate}
              onChange={setEndDate}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            onClick={onCancel}
            className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all hover:bg-current/5 rounded-2xl"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3"
          >
            <Check size={18} strokeWidth={4} /> Validar Cronograma
          </button>
        </div>
      </div>
    </div>
  );
}
