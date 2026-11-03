import { lazy } from "react";
import { CalendarCheck } from "lucide-react";
import { defineWidget } from "../define";
import { presenceContentSchema } from "../schemas/presence";

export default defineWidget({
  id: "presence",
  title: "Calendário de Presença",
  description: "Rastreie frequência em eventos recorrentes.",
  icon: <CalendarCheck size={24} />,
  color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  defaultHeight: 4,
  schema: presenceContentSchema,
  component: lazy(() => import("@/components/layout/boxes/PresenceCalendarBox")),
});
