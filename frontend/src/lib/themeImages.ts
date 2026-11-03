const WALLPAPER_DIR = "/images-themes/";

/**
 * The light version of a built-in theme wallpaper, for cards and previews.
 *
 * `/images-themes/cat-pile.png` -> `/images-themes/thumbs/cat-pile.webp`. The full-size image
 * is only for when a theme is applied. Anything else (an uploaded image, a data URL, an external
 * link) has no thumbnail and comes back unchanged. The files are made by
 * `scripts/make-theme-thumbs.sh`.
 */
export function themeThumbnail(src: string | null | undefined): string | null {
  if (!src) return null;
  if (!src.startsWith(WALLPAPER_DIR) || !src.endsWith(".png")) return src;
  const name = src.slice(WALLPAPER_DIR.length, -".png".length);
  return `${WALLPAPER_DIR}thumbs/${name}.webp`;
}
