import { useMemo } from 'react';

import { getTheme, Theme } from '@/lib/theme';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { useAppearanceStore } from '@/store/useAppearanceStore';

export function useTheme(): Theme {
  const colorScheme = useEffectiveColorScheme();
  const customAccentColor = useAppearanceStore((state) => state.customAccentColor);

  return useMemo(() => {
    const theme = getTheme(colorScheme);
    if (customAccentColor) {
      // Calculate accentMuted with opacity
      const r = parseInt(customAccentColor.slice(1, 3), 16);
      const g = parseInt(customAccentColor.slice(3, 5), 16);
      const b = parseInt(customAccentColor.slice(5, 7), 16);
      const accentMuted = `rgba(${r}, ${g}, ${b}, 0.15)`;
      
      return {
        ...theme,
        colors: {
          ...theme.colors,
          accent: customAccentColor,
          accentMuted,
        },
      };
    }
    return theme;
  }, [colorScheme, customAccentColor]);
}



