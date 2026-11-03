/**
 * Whether a CSS color is dark, by its relative luminance. Understands `#rgb`, `#rrggbb`,
 * `rgb()` and `hsl()`; anything else (a named color, `var(...)`) counts as light.
 */
export function isDarkColor(color: string): boolean {
  const rgb = toRgb(color.trim().toLowerCase());
  if (!rgb) return false;
  const [r, g, b] = rgb.map((v) => v / 255);
  // Rec. 601 luma is enough to tell dark from light.
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

function toRgb(color: string): [number, number, number] | null {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  const rgb = color.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

  const hsl = color.match(/^hsla?\(\s*([\d.]+)(?:deg)?[ ,]+([\d.]+)%[ ,]+([\d.]+)%/);
  if (hsl) {
    const h = Number(hsl[1]) % 360;
    const s = Number(hsl[2]) / 100;
    const l = Number(hsl[3]) / 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return [f(0), f(8), f(4)];
  }

  return null;
}
