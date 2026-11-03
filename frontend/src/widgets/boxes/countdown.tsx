import { lazy } from "react";
import { Clock } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "countdown",
  title: "Countdown",
  description: "Contagem regressiva.",
  icon: <Clock size={24} />,
  color: "text-teal-500 bg-teal-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/CountdownBox")),
});
