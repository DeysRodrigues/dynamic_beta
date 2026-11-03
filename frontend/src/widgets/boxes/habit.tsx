import { lazy } from "react";
import { Activity } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "habit",
  title: "Hábito Tracker",
  description: "Consistência diária.",
  icon: <Activity size={24} />,
  color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/HabitTrackerBox")),
});
