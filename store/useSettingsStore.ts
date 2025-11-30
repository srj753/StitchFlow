import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';

type SettingsState = {
  keepScreenAwake: boolean;
  voiceHintsEnabled: boolean;
  aiAssistantEnabled: boolean; // New setting
  setKeepScreenAwake: (value: boolean) => void;
  toggleVoiceHints: () => void;
  toggleAiAssistant: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      keepScreenAwake: false,
      voiceHintsEnabled: false,
      aiAssistantEnabled: true, // Default to true (or false if preferred)
      setKeepScreenAwake: (value) => set({ keepScreenAwake: value }),
      toggleVoiceHints: () => set({ voiceHintsEnabled: !get().voiceHintsEnabled }),
      toggleAiAssistant: () => set({ aiAssistantEnabled: !get().aiAssistantEnabled }),
    }),
    {
      name: 'knotiq-settings',
      storage: createJSONStorage(resolveStateStorage),
    },
  ),
);
