import { lazy } from "react";
import { ListTodo } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "tasks",
  title: "Lista de Tarefas",
  description: "Gerenciador principal.",
  icon: <ListTodo size={24} />,
  color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/BoxTask")),
});
