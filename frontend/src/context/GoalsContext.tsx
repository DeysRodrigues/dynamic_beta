"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface Goal {
  tag: string;
  hours: number;
}

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  removeGoal: (index: number) => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider = ({ children }: { children: React.ReactNode }) => {
  // Carrega as metas do localStorage ao inicializar
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("weeklyGoals");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validação dos dados carregados
          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item: any) =>
                typeof item.tag === "string" && typeof item.hours === "number"
            )
          ) {
            return parsed;
          } else {
            console.error("Dados inválidos no localStorage. Resetando...");
            return [];
          }
        }
        return [];
      } catch (error) {
        console.error("Erro ao carregar goals do localStorage:", error);
        return [];
      }
    }
    return [];
  });

  // Salva as metas no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem("weeklyGoals", JSON.stringify(goals));
    } catch (error) {
      console.error("Erro ao salvar goals no localStorage:", error);
    }
  }, [goals]);

  // Adiciona uma nova meta
  const addGoal = (goal: Goal) => {
    if (!goal.tag || goal.hours <= 0) {
      console.error("Meta inválida. Verifique os valores.");
      return;
    }
    setGoals((prev) => [...prev, goal]);
  };

  // Remove uma meta pelo índice
  const removeGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <GoalsContext.Provider value={{ goals, addGoal, removeGoal }}>
      {children}
    </GoalsContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useGoalsContext = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error("useGoalsContext must be used inside GoalsProvider");
  }
  return context;
};