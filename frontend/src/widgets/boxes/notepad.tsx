import { lazy } from "react";
import { FileText } from "lucide-react";
import { defineWidget } from "../define";
import { notepadContentSchema } from "../schemas/notepad";

export default defineWidget({
  id: "notepad",
  title: "Bloco de Notas",
  description: "Rascunhos rápidos.",
  icon: <FileText size={24} />,
  color: "text-yellow-500 bg-yellow-500/10",
  defaultHeight: 4,
  schema: notepadContentSchema,
  component: lazy(() => import("@/components/layout/boxes/NotepadBox")),
});
