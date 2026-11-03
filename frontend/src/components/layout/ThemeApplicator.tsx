import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { isDarkColor } from '@/lib/color';

export function ThemeApplicator() {
  const { primaryColor, sidebarColor, boxOpacity, boxColor, textColor, backgroundColor, glassEffect } = useThemeStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--sidebar', sidebarColor);
    document.documentElement.style.setProperty('--box-opacity', String(boxOpacity));
    document.documentElement.style.setProperty('--box-color', boxColor);
    document.documentElement.style.setProperty('--box-text-color', textColor);
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--glass-blur', `${glassEffect}px`);

    // A dark page needs the browser's own controls (select lists, scrollbars, the date icon)
    // drawn dark too, otherwise they show up as white boxes.
    const isDark = isDarkColor(backgroundColor);
    document.documentElement.style.setProperty('--calendar-invert', isDark ? '1' : '0');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

  }, [primaryColor, sidebarColor, boxOpacity, boxColor, textColor, backgroundColor, glassEffect]);

  return null;
}