import { lazy } from "react";
import { FileText } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "notepad",
  title: "Bloco de Notas",
  description: "Rascunhos rápidos.",
  icon: <FileText size={24} />,
  color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  defaultHeight: 4,
  component: lazy(() => import("@/components/layout/boxes/NotepadBox")),
});
