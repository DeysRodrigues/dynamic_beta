import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

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

    // Inverte o ícone do calendário se o fundo for escuro (heurística simples)
    const isDark = backgroundColor.startsWith('#0') || backgroundColor.startsWith('#1') || backgroundColor.startsWith('#2');
    document.documentElement.style.setProperty('--calendar-invert', isDark ? '1' : '0');

  }, [primaryColor, sidebarColor, boxOpacity, boxColor, textColor, backgroundColor, glassEffect]);

  return null;
}