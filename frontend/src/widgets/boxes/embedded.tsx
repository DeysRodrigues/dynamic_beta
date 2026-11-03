import { lazy } from "react";
import { LayoutTemplate } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "embedded",
  title: "Smart Embed",
  description: "Vídeos e iframes.",
  icon: <LayoutTemplate size={24} />,
  color: "text-slate-500 bg-slate-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/EmbeddedBox")),
});
