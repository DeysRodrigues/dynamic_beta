import { Gamepad2, Droplets, Share2 } from "lucide-react";
import { catalogWidgets } from "@/widgets/registry";

// =====================================================================
// 1. WIDGETS NATIVOS (Instalam Caixas Funcionais)
// =====================================================================
/** Derived from the widget registry: there is no second list to keep in sync. */
export const nativeWidgets = catalogWidgets;

// =====================================================================
// 2. EMBEDS (Links para Copiar)
// =====================================================================
export const embedWidgets = [
  {
    id: "snake",
    title: "Pixel Snake",
    description: "Jogo da cobrinha.",
    path: "/w/snake",
    icon: <Gamepad2 size={24} />,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "water",
    title: "Hidratação",
    description: "Contador de água.",
    path: "/w/water",
    icon: <Droplets size={24} />,
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "bio",
    title: "Social Links",
    description: "Cartão de visitas.",
    path: "/w/bio",
    icon: <Share2 size={24} />,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
];
