import { lazy } from "react";
import { Timer } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "pomodoro",
  title: "Pomodoro Timer",
  description: "Foco total com timer.",
  icon: <Timer size={24} />,
  color: "text-red-500 bg-red-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/PomodoroBox")),
});
