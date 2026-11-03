import { lazy } from "react";
import { Link2 } from "lucide-react";
import { defineWidget } from "../define";
import { quickLinksContentSchema } from "../schemas/quicklinks";

export default defineWidget({
  id: "quicklinks",
  title: "Quick Links",
  description: "Links favoritos organizados por abas.",
  icon: <Link2 size={24} />,
  color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  defaultHeight: 3,
  schema: quickLinksContentSchema,
  component: lazy(() => import("@/components/layout/boxes/QuickLinksBox")),
});
