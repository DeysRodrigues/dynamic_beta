import { lazy } from "react";
import { Hourglass } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "metatags",
  title: "Metas por Tag",
  description: "Defina uma meta de horas para cada tag e acompanhe o progresso.",
  icon: <Hourglass size={24} />,
  color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/MetaTagsBox")),
});
