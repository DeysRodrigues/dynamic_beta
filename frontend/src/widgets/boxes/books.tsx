import { lazy } from "react";
import { BookOpen } from "lucide-react";
import { defineWidget } from "../define";
import { bookTrackerContentSchema } from "../schemas/books";

export default defineWidget({
  id: "books",
  title: "Book Tracker",
  description: "Progresso de leitura.",
  icon: <BookOpen size={24} />,
  color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  defaultHeight: 3,
  schema: bookTrackerContentSchema,
  component: lazy(() => import("@/components/layout/boxes/BookTrackerBox")),
});
