import { lazy } from "react";
import { Terminal } from "lucide-react";
import { defineWidget } from "../define";
import { snippetContentSchema } from "../schemas/snippet";

export default defineWidget({
  id: "snippet",
  title: "Code Snippets",
  description: "Seu banco de códigos e comandos.",
  icon: <Terminal size={24} />,
  color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  defaultHeight: 3,
  schema: snippetContentSchema,
  component: lazy(() => import("@/components/layout/boxes/CodeSnippetBox")),
});
