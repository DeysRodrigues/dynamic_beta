#!/usr/bin/env bash
# Makes the light thumbnails the theme cards show, from the full-size wallpapers.
#
#   public/images-themes/<name>.png  ->  public/images-themes/thumbs/<name>.webp
#
# The originals stay as they are: they are the wallpaper once a theme is applied. Run this
# again whenever a wallpaper is added or changed (needs ImageMagick with WebP support).
set -euo pipefail

cd "$(dirname "$0")/../public/images-themes"
mkdir -p thumbs

# Screenshots used by the landing page are not theme wallpapers.
SKIP=" dashboard-preview.png gallery-preview.png image.png "

for src in *.png; do
  case "$SKIP" in *" $src "*) continue ;; esac
  out="thumbs/${src%.png}.webp"
  magick "$src" -resize 640x -strip -quality 70 -define webp:method=6 "$out"
  printf '%-28s %8s -> %8s\n' "$src" "$(stat -c%s "$src")" "$(stat -c%s "$out")"
done
