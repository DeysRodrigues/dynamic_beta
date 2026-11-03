import { lazy } from "react";
import { CalendarDays } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "calendar",
  title: "Calendário",
  description: "Visão mensal.",
  icon: <CalendarDays size={24} />,
  color: "text-blue-500 bg-blue-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/MiniCalendarBox")),
});
