import { lazy } from "react";
import { Book } from "lucide-react";
import { defineWidget } from "../define";
import { libraryContentSchema } from "../schemas/library";

export default defineWidget({
  id: "library",
  title: "Cozy Library",
  description: "Estante de livros.",
  icon: <Book size={24} />,
  color: "text-amber-600 bg-amber-600/10 border-amber-600/20",
  defaultHeight: 3,
  schema: libraryContentSchema,
  component: lazy(() => import("@/components/layout/boxes/CozyLibraryBox")),
});
