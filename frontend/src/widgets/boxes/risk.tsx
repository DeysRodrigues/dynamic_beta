import { lazy } from "react";
import { AlertTriangle } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "risk",
  title: "Gestão de Risco",
  description: "Controle de faltas e limites com alertas.",
  icon: <AlertTriangle size={24} />,
  color: "text-orange-500 bg-orange-500/10",
  defaultHeight: 4,
  component: lazy(() => import("@/components/layout/boxes/RiskTrackerBox")),
});
