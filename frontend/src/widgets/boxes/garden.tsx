import { lazy } from "react";
import { Sprout } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "garden",
  title: "Pixel Garden",
  description: "Planta de produtividade.",
  icon: <Sprout size={24} />,
  color: "text-green-500 bg-green-500/10 border-green-500/20",
  defaultHeight: 4,
  component: lazy(() => import("@/components/layout/boxes/PixelGardenBox")),
});
