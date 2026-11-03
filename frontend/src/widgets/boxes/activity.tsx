import { lazy } from "react";
import { TrendingUp } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "activity",
  title: "Metas Cumulativas",
  description: "Rastreie XP, calorias ou economia diária.",
  icon: <TrendingUp size={24} />,
  color: "text-yellow-600 bg-yellow-500/10",
  defaultHeight: 4,
  component: lazy(() => import("@/components/layout/boxes/ActivityGoalsBox")),
});
