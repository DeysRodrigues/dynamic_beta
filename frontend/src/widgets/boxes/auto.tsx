import { lazy } from "react";
import { Zap } from "lucide-react";
import { defineWidget } from "../define";
import { automationContentSchema } from "../schemas/automation";

export default defineWidget({
  id: "auto",
  title: "Automações",
  description: "Gatilhos e regras.",
  icon: <Zap size={24} />,
  color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  defaultHeight: 3,
  schema: automationContentSchema,
  component: lazy(() => import("@/components/layout/boxes/AutomationBox")),
});
