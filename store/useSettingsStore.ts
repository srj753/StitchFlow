import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';

import { AiProvider } from '@/lib/aiService';

type SettingsState = {
  keepScreenAwake: boolean;
  voiceHintsEnabled: boolean;
  aiAssistantEnabled: boolean;
  openaiApiKey?: string;
  aiProvider: AiProvider;
  setKeepScreenAwake: (value: boolean) => void;
  toggleVoiceHints: () => void;
  toggleAiAssistant: () => void;
  setOpenaiApiKey: (key: string) => void;
  setAiProvider: (provider: AiProvider) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      keepScreenAwake: false,
      voiceHintsEnabled: false,
      aiAssistantEnabled: true,
      openaiApiKey: undefined,
      aiProvider: 'groq', // Default
      setKeepScreenAwake: (value) => set({ keepScreenAwake: value }),
      toggleVoiceHints: () => set({ voiceHintsEnabled: !get().voiceHintsEnabled }),
      toggleAiAssistant: () => set({ aiAssistantEnabled: !get().aiAssistantEnabled }),
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
      setAiProvider: (provider) => set({ aiProvider: provider }),
    }),
    {
      name: 'knotiq-settings',
      storage: createJSONStorage(resolveStateStorage),
    },
  ),
);
