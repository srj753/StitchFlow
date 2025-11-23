import { useMemo } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { useAppearanceStore } from '@/store/useAppearanceStore';

export function useEffectiveColorScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const mode = useAppearanceStore((state) => state.mode);

  return useMemo(() => {
    if (mode === 'system') {
      return systemScheme ?? 'dark';
    }
    return mode;
  }, [mode, systemScheme]);
}


