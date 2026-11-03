import type { ReactNode } from "react";

interface SettingsSliderProps {
  icon: ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

/** A labelled range input, the row used by every slider in the settings drawer. */
export function SettingsSlider({ icon, label, value, min, max, step, onChange }: SettingsSliderProps) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
      <span className="text-xs font-medium flex items-center gap-2 text-white/80">
        {icon} {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}
