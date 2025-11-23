import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';

type SettingsState = {
  keepScreenAwake: boolean;
  voiceHintsEnabled: boolean;
  setKeepScreenAwake: (value: boolean) => void;
  toggleVoiceHints: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      keepScreenAwake: false,
      voiceHintsEnabled: false,
      setKeepScreenAwake: (value) => set({ keepScreenAwake: value }),
      toggleVoiceHints: () => set({ voiceHintsEnabled: !get().voiceHintsEnabled }),
    }),
    {
      name: 'knotiq-settings',
      storage: createJSONStorage(resolveStateStorage),
    },
  ),
);



