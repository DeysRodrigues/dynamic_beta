import { lazy } from "react";
import { Dumbbell } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "workout",
  title: "Quick Workout",
  description: "Exercícios rápidos.",
  icon: <Dumbbell size={24} />,
  color: "text-orange-500 bg-orange-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/QuickWorkoutBox")),
});
