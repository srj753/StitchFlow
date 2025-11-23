import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

type AppearanceState = {
  mode: ThemeMode;
  customAccentColor?: string;
  setMode: (mode: ThemeMode) => void;
  setCustomAccentColor: (color: string | undefined) => void;
  cycleMode: () => void;
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      customAccentColor: undefined,
      setMode: (mode) => set({ mode }),
      setCustomAccentColor: (color) => set({ customAccentColor: color }),
      cycleMode: () => {
        const order: ThemeMode[] = ['system', 'light', 'dark'];
        const currentIndex = order.indexOf(get().mode);
        const nextMode = order[(currentIndex + 1) % order.length];
        set({ mode: nextMode });
      },
    }),
    {
      name: 'knotiq-appearance',
      storage: createJSONStorage(resolveStateStorage),
    },
  ),
);


