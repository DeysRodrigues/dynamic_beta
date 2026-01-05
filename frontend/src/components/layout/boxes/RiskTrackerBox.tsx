import { useState } from "react";
import {
  AlertTriangle,
  Skull,
  Plus,
  Trash2,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Percent,
  Hash,
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";

interface RiskItem {
  id: string;
  title: string;
  total: number;
  limit: number; // Sempre salvo em unidades absolutas
  current: number;
  consequence: string;
}

export default function RiskTrackerBox({
  id = "risk-default",
}: {
  id?: string;
}) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const saved = getBoxContent(id);

  const [items, setItems] = useState<RiskItem[]>(saved.items || []);
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [limitMode, setLimitMode] = useState<"unit" | "percent">("percent"); // Padrão agora é %
  const [consequence, setConsequence] = useState("");

  const save = (data: RiskItem[]) => {
    setItems(data);
    setBoxContent(id, { items: data });
  };

  const addItem = () => {
    if (!title || !limitInput || !total)
      return alert("Preencha título, total e limite.");

    const totalValue = Number(total);
    const rawLimit = Number(limitInput);

    // MÁGICA AQUI: Converte % para Unidades se necessário
    let finalLimit = rawLimit;
    if (limitMode === "percent") {
      // Ex: 25% de 80 aulas = 20 faltas permitidas
      finalLimit = Math.floor(totalValue * (rawLimit / 100));
    }

    const newItem: RiskItem = {
      id: crypto.randomUUID(),
      title,
      total: totalValue,
      limit: finalLimit,
      current: 0,
      consequence: consequence || "Limite atingido!",
    };

    save([...items, newItem]);
    setIsAdding(false);

    // Reset form
    setTitle("");
    setTotal("");
    setLimitInput("");
    setConsequence("");
  };

  const updateCount = (itemId: string, delta: number) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, current: Math.max(0, item.current + delta) };
      }
      return item;
    });
    save(updated);
  };

  const deleteItem = (itemId: string) => {
    if (confirm("Remover este rastreador?")) {
      save(items.filter((i) => i.id !== itemId));
    }
  };

  const getProgressBarColor = (current: number, limit: number) => {
    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    if (percentage >= 100) return "var(--risk-critical-text)";
    if (percentage >= 80) return "var(--risk-danger-text)";
    if (percentage >= 50) return "var(--risk-warning-text)";
    return "var(--risk-safe-text)";
  };

  return (
    <div className="box-padrao p-0 flex flex-col relative overflow-hidden h-full">
      {/* HEADER */}
      <div className="p-3 flex justify-between items-center bg-current/5">
        <h2 className="font-bold flex items-center gap-2 text-sm">
          <AlertTriangle size={16} style={{ color: "var(--risk-danger-text)" }} /> Gestão de
          Risco
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`p-1.5 rounded-md transition ${
            isAdding
              ? "bg-primary text-primary-foreground"
              : "hover:bg-current/10 text-primary"
          }`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* FORMULÁRIO INTELIGENTE */}
      {isAdding && (
        <div className="p-3 bg-current/5 animate-in slide-in-from-top-2 space-y-2">
          <input
            placeholder="O que você quer controlar? (Ex: Faltas Cálculo)"
            className="w-full text-xs p-2 rounded bg-black/5 outline-none focus:ring-1 focus:ring-primary/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="flex gap-2 items-center">
            {/* Input Total */}
            <div className="flex-1">
              <input
                type="number"
                placeholder="Total (Ex: 80 aulas)"
                className="w-full text-xs p-2 rounded bg-black/5 outline-none focus:ring-1 focus:ring-primary/50"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>

            {/* Input Limite com Toggle */}
            <div className="flex-[1.5] flex gap-1">
              <input
                type="number"
                placeholder={
                  limitMode === "percent"
                    ? "Max % (Ex: 25)"
                    : "Max Unid (Ex: 20)"
                }
                className="w-full text-xs p-2 rounded-l bg-black/5 outline-none focus:ring-1 focus:ring-primary/50"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
              />
              <button
                onClick={() =>
                  setLimitMode(limitMode === "percent" ? "unit" : "percent")
                }
                className="px-2 bg-black/10 hover:bg-black/20 rounded-r text-xs font-bold w-10 flex items-center justify-center transition"
                title={
                  limitMode === "percent"
                    ? "Mudar para Unidades"
                    : "Mudar para Porcentagem"
                }
              >
                {limitMode === "percent" ? (
                  <Percent size={14} />
                ) : (
                  <Hash size={14} />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              placeholder="Consequência (Ex: Reprovação direta)"
              className="w-full text-xs p-2 rounded bg-black/5 outline-none focus:ring-1 focus:ring-primary/50 pl-7"
              value={consequence}
              onChange={(e) => setConsequence(e.target.value)}
            />
            <Skull size={14} className="absolute top-2 left-2 opacity-40" />
          </div>

          <button
            onClick={addItem}
            className="w-full bg-primary text-primary-foreground py-2 rounded text-xs font-bold hover:opacity-90 transition"
          >
            INICIAR MONITORAMENTO
          </button>
        </div>
      )}

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {items.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center gap-2 min-h-[100px]">
            <ShieldCheck size={32} />
            <p className="text-[10px]">
              Controle faltas, louças ou
              <br />
              dias sem ir à academia.
            </p>
          </div>
        )}

        {items.map((item) => {
          const percentUsed = Math.min(100, (item.current / item.limit) * 100);
          const percentTotal = Math.round((item.current / item.total) * 100);
          const progressBarColor = getProgressBarColor(item.current, item.limit);
          const isFailed = item.current >= item.limit;
          const remaining = item.limit - item.current;

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl transition-colors relative group bg-current/5"
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-sm leading-tight truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold opacity-70 bg-black/5 px-1.5 py-0.5 rounded">
                      {item.current} / {item.limit} limite
                    </span>
                    <span className="text-[10px] opacity-60">
                      ({percentTotal}% do total)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-50 hover:opacity-100 hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)] rounded transition absolute top-2 right-2"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Barra de Progresso */}
              <div className="relative w-full h-2 bg-black/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${percentUsed}%`,
                    backgroundColor: progressBarColor,
                  }}
                />
              </div>

              {/* Footer: Controles + Aviso */}
              <div className="flex justify-between items-center mt-1">
                {/* Aviso de Perigo */}
                <div className="flex-1 min-w-0 pr-2">
                  {percentUsed >= 80 ? (
                    <div
                      className="flex items-center gap-1 text-[10px] font-bold animate-pulse truncate"
                      style={{
                        color: isFailed
                          ? "var(--risk-critical-text)"
                          : "var(--risk-danger-text)",
                      }}
                    >
                      <Skull size={10} />{" "}
                      {isFailed
                        ? `FALHOU: ${item.consequence}`
                        : `Restam ${remaining}: ${item.consequence}`}
                    </div>
                  ) : (
                    <span className="text-[10px] opacity-60 truncate block">
                      Você ainda pode falhar {remaining}x
                    </span>
                  )}
                </div>

                {/* Botões + / - */}
                <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm p-0.5 rounded-lg shadow-sm">
                  <button
                    onClick={() => updateCount(item.id, -1)}
                    className="p-1 hover:bg-primary/10 rounded transition text-primary"
                  >
                    <MinusCircle size={14} />
                  </button>
                  <button
                    onClick={() => updateCount(item.id, 1)}
                    className="p-1 hover:bg-primary/10 rounded transition text-primary"
                  >
                    <PlusCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
