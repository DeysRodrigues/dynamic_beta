import React from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon: React.ElementType;
}

export const ColorPicker = React.memo(({ label, value, onChange, icon: Icon }: ColorPickerProps) => (
  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition group/picker">
    {/* 1. Color (input) */}
    <div
      className="relative h-8 w-8 rounded-full shadow-sm border border-white/20 overflow-hidden cursor-pointer ring-2 ring-white/5 hover:ring-white/20 transition shrink-0"
      style={{ backgroundColor: value }}
    >
      <input
        type="color"
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer scale-150"
      />
    </div>

    {/* 2. Texto */}
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[10px] font-bold uppercase opacity-60 flex items-center gap-1.5 group-hover/picker:opacity-100 transition text-white">
        <Icon size={12} /> {label}
      </span>
      <span className="text-[9px] font-mono opacity-30 uppercase truncate text-white">
        {value}
      </span>
    </div>
  </div>
));
