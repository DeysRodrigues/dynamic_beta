import { Palette, Check } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeBox() {
  const { primaryColor, sidebarColor, setPrimaryColor, setSidebarColor } = useThemeStore();

  const themes = [
    { name: "Default", primary: "#616EFF", sidebar: "oklch(0.6086 0.2128 274.31)" },
    { name: "Rose", primary: "#ec4899", sidebar: "#be185d" },
    { name: "Ocean", primary: "#06b6d4", sidebar: "#0e7490" },
    { name: "Forest", primary: "#22c55e", sidebar: "#15803d" },
    { name: "Sunset", primary: "#f97316", sidebar: "#c2410c" },
    { name: "Dark", primary: "#6366f1", sidebar: "#1e1b4b" },
  ];

  const applyTheme = (t: typeof themes[0]) => {
    setPrimaryColor(t.primary);
    setSidebarColor(t.sidebar);
  };

  const currentThemeName = themes.find(t => t.primary === primaryColor && t.sidebar === sidebarColor)?.name || "Custom";

  return (
    <div className="box-padrao">
      <div className="flex items-center gap-2 mb-3">
        <Palette size={18} />
        <h2 className="font-bold text-sm">Temas</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => applyTheme(t)}
            className={`h-8 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-100 ${
              currentThemeName === t.name
                ? "ring-2 ring-offset-1 ring-ring"
                : "shadow-md hover:shadow-lg"
            }`}
            style={{ backgroundColor: t.primary }}
            title={t.name}
          >
            {currentThemeName === t.name && <Check size={12} className="text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}