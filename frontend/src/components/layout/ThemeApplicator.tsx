import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeApplicator() {
  const { primaryColor, sidebarColor, boxOpacity, boxColor, textColor, backgroundColor } = useThemeStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--sidebar', sidebarColor);
    document.documentElement.style.setProperty('--box-opacity', String(boxOpacity));
    document.documentElement.style.setProperty('--box-color', boxColor);
    document.documentElement.style.setProperty('--box-text-color', textColor);
    document.documentElement.style.setProperty('--background-color', backgroundColor);
  }, [primaryColor, sidebarColor, boxOpacity, boxColor, textColor, backgroundColor]);

  return null;
}