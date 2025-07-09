import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Layouts } from "react-grid-layout";

// Layouts padrão
const defaultLayouts: Layouts = {
  lg: [
    { i: "progress", x: 0, y: 0, w: 2, h: 2 },
    { i: "metatags", x: 0, y: 0, w: 2, h: 2 },
    { i: "hours", x: 0, y: 0, w: 2, h: 2 },
    { i: "pomodoro", x: 2, y: 2, w: 1, h: 4 },
    { i: "tasksimport", x: 2, y: 3, w: 1, h: 2 },
    { i: "embedded", x: 3, y: 1, w: 1, h: 4 },
    { i: "tags", x: 3, y: 1, w: 1, h: 2 },
  ],
  md: [
    { i: "progress", x: 0, y: 0, w: 2, h: 2 },
    { i: "metatags", x: 0, y: 0, w: 2, h: 2 },
    { i: "hours", x: 0, y: 0, w: 2, h: 2 },
    { i: "pomodoro", x: 2, y: 2, w: 1, h: 4 },
    { i: "tasksimport", x: 2, y: 3, w: 1, h: 2 },
    { i: "embedded", x: 3, y: 1, w: 1, h: 4 },
    { i: "tags", x: 3, y: 1, w: 1, h: 2 },
  ],
  sm: [
    { i: "progress", x: 0, y: 0, w: 2, h: 1.4 },
    { i: "metatags", x: 0, y: 0, w: 2, h: 2 },
    { i: "hours", x: 0, y: 0, w: 2, h: 3 },
    { i: "pomodoro", x: 2, y: 2, w: 1, h: 4 },
    { i: "tasksimport", x: 2, y: 3, w: 1, h: 2 },
    { i: "embedded", x: 3, y: 1, w: 1, h: 3.3 },
    { i: "tags", x: 3, y: 1, w: 1, h: 42 },
  ],
};

const defaultBoxes = [
  "progress",
  "tags",
  "hours",
  "pomodoro",
  "tasksimport",
  "embedded",
  "metatags",
];

// Tipagem do contexto
type DashboardContextType = {
  layouts: Layouts;
  setLayouts: React.Dispatch<React.SetStateAction<Layouts>>;
  boxes: string[];
  setBoxes: React.Dispatch<React.SetStateAction<string[]>>;
  resetDashboard: () => void;
  saveDashboard: () => void;
};

// Criação do contexto
const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

// Provider
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const saved = localStorage.getItem("dashboardLayouts");
    return saved ? JSON.parse(saved) : defaultLayouts;
  });

  const [boxes, setBoxes] = useState<string[]>(() => {
    const saved = localStorage.getItem("dashboardBoxes");
    return saved ? JSON.parse(saved) : defaultBoxes;
  });

  // Salvando no localStorage automaticamente ao alterar
  useEffect(() => {
    localStorage.setItem("dashboardLayouts", JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    localStorage.setItem("dashboardBoxes", JSON.stringify(boxes));
  }, [boxes]);

  // Função para resetar manualmente
  const resetDashboard = () => {
    setLayouts(defaultLayouts);
    setBoxes(defaultBoxes);
    localStorage.removeItem("dashboardLayouts");
    localStorage.removeItem("dashboardBoxes");
  };

  // Função para salvar manualmente
  const saveDashboard = () => {
    localStorage.setItem("dashboardLayouts", JSON.stringify(layouts));
    localStorage.setItem("dashboardBoxes", JSON.stringify(boxes));
  };

  return (
    <DashboardContext.Provider
      value={{
        layouts,
        setLayouts,
        boxes,
        setBoxes,
        resetDashboard,
        saveDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Hook de acesso ao contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard precisa estar dentro do DashboardProvider");
  return context;
};
