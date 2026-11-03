import { lazy } from "react";
import { Target } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "three_frogs",
  title: "Os 3 Sapos",
  description: "Foque nas 3 tarefas mais importantes do dia para vencer a procrastinação.",
  icon: <Target size={24} />,
  color: "var(--primary-color)",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/ThreeFrogsBox")),
});
