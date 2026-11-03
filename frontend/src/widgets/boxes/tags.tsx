import { lazy } from "react";
import { Tags } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "tags",
  title: "Tags Admin",
  description: "Gerenciar etiquetas.",
  icon: <Tags size={24} />,
  color: "text-violet-500 bg-violet-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/TagsBox")),
});
