import { lazy } from "react";
import { Sword } from "lucide-react";
import { defineWidget } from "../define";

export default defineWidget({
  id: "rpg",
  title: "Perfil RPG",
  description: "Gamification pessoal.",
  icon: <Sword size={24} />,
  color: "text-stone-500 bg-stone-500/10",
  defaultHeight: 3,
  component: lazy(() => import("@/components/layout/boxes/RpgProfileBox")),
});
