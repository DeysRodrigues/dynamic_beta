import { lazy } from "react";
import { Palette } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "theme",
  title: "Camaleão",
  description: "Troca rápida de cor.",
  icon: <Palette size={24} />,
  color: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20",
  defaultHeight: 2,
  component: lazy(() => import("@/components/layout/boxes/ThemeBox")),
});
