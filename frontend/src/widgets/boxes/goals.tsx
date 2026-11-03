import { lazy } from "react";
import { Target } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "goals",
  title: "Metas 30 Dias",
  description: "Desafios mensais.",
  icon: <Target size={24} />,
  color: "text-pink-500 bg-pink-500/10",
  defaultHeight: 4,
  component: lazy(() => import("@/components/layout/boxes/MonthlyGoalsBox")),
});
