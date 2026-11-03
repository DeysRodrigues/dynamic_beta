import { lazy } from "react";
import { BarChart3 } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "progress",
  title: "Progresso",
  description: "Barra de XP geral.",
  icon: <BarChart3 size={24} />,
  color: "text-blue-600 bg-blue-600/10 border-blue-600/20",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/ProgressBox")),
});
