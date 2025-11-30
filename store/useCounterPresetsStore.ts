import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';
import { CounterPreset, CounterPresetInput } from '@/types/counterPreset';

type CounterPresetsState = {
  presets: CounterPreset[];
  addPreset: (input: CounterPresetInput) => CounterPreset;
  updatePreset: (id: string, input: Partial<CounterPresetInput>) => void;
  deletePreset: (id: string) => void;
  getPresetsByCategory: (category: CounterPreset['category']) => CounterPreset[];
};

const now = () => new Date().toISOString();

const generateId = () =>
  `preset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const createPreset = (input: CounterPresetInput): CounterPreset => ({
  id: generateId(),
  name: input.name.trim(),
  description: input.description?.trim(),
  category: input.category,
  counters: input.counters,
  createdAt: now(),
  updatedAt: now(),
});

// Default presets
const defaultPresets: CounterPreset[] = [
  {
    id: 'preset_amigurumi',
    name: 'Amigurumi',
    description: 'Standard counters for amigurumi projects',
    category: 'amigurumi',
    counters: [
      { type: 'row', label: 'Rounds', targetValue: undefined },
      { type: 'stitch', label: 'Stitches', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_blanket',
    name: 'Blanket',
    description: 'Counters for blanket projects',
    category: 'blanket',
    counters: [
      { type: 'row', label: 'Rows', targetValue: undefined },
      { type: 'stitch', label: 'Stitches per Row', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_garment',
    name: 'Garment',
    description: 'Counters for sweaters, cardigans, and garments',
    category: 'garment',
    counters: [
      { type: 'row', label: 'Body Rows', targetValue: undefined },
      { type: 'row', label: 'Sleeve Rows', targetValue: undefined },
      { type: 'custom', label: 'Neckline', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_accessory',
    name: 'Accessory',
    description: 'Counters for hats, scarves, and accessories',
    category: 'accessory',
    counters: [
      { type: 'row', label: 'Rounds/Rows', targetValue: undefined },
      { type: 'stitch', label: 'Stitches', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];

export const useCounterPresetsStore = create<CounterPresetsState>()(
  persist(
    (set, get) => ({
      presets: defaultPresets,
      addPreset: (input) => {
        const preset = createPreset(input);
        set((state) => ({
          presets: [preset, ...state.presets],
        }));
        return preset;
      },
      updatePreset: (id, input) => {
        set((state) => ({
          presets: state.presets.map((preset) =>
            preset.id === id
              ? {
                  ...preset,
                  ...input,
                  name: input.name?.trim() ?? preset.name,
                  description: input.description?.trim() ?? preset.description,
                  updatedAt: now(),
                }
              : preset,
          ),
        }));
      },
      deletePreset: (id) => {
        // Don't allow deleting default presets
        if (id.startsWith('preset_')) return;
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== id),
        }));
      },
      getPresetsByCategory: (category) => {
        return get().presets.filter((preset) => preset.category === category);
      },
    }),
    {
      name: 'knotiq-counter-presets',
      storage: createJSONStorage(resolveStateStorage),
      onRehydrateStorage: () => (state) => {
        // Merge defaults with persisted data on rehydration
        if (state && state.presets) {
          const existingPresetIds = new Set(state.presets.map((p: CounterPreset) => p.id));
          const missingDefaults = defaultPresets.filter((p) => !existingPresetIds.has(p.id));
          
          if (missingDefaults.length > 0) {
            // Merge defaults with existing presets
            state.presets = [...missingDefaults, ...state.presets];
          }
        } else if (state) {
          // If no presets exist, use defaults
          state.presets = defaultPresets;
        }
      },
    },
  ),
);

