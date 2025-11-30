import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';
import { CounterPreset, CounterPresetInput } from '@/types/counterPreset';

type PresetUsage = {
  presetId: string;
  usageCount: number;
  lastUsed: string;
  categories: string[]; // Project categories this preset was used with
};

type CounterPresetsState = {
  presets: CounterPreset[];
  usage: Record<string, PresetUsage>; // Track preset usage
  addPreset: (input: CounterPresetInput) => CounterPreset;
  updatePreset: (id: string, input: Partial<CounterPresetInput>) => void;
  deletePreset: (id: string) => void;
  getPresetsByCategory: (category: CounterPreset['category']) => CounterPreset[];
  recordUsage: (presetId: string, projectCategory?: string) => void;
  getMostUsedPresets: (limit?: number) => CounterPreset[];
  getSuggestedPresets: (projectCategory?: string, patternName?: string) => CounterPreset[];
  exportPresets: () => string;
  importPresets: (jsonString: string) => { imported: number; errors: string[] };
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

// Default presets - Expanded library
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
  {
    id: 'preset_sweater',
    name: 'Sweater',
    description: 'Complete sweater with body and sleeves',
    category: 'garment',
    counters: [
      { type: 'row', label: 'Body Rows', targetValue: undefined },
      { type: 'row', label: 'Left Sleeve', targetValue: undefined },
      { type: 'row', label: 'Right Sleeve', targetValue: undefined },
      { type: 'row', label: 'Collar Rows', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_cardigan',
    name: 'Cardigan',
    description: 'Cardigan with front panels and sleeves',
    category: 'garment',
    counters: [
      { type: 'row', label: 'Back Panel', targetValue: undefined },
      { type: 'row', label: 'Left Front', targetValue: undefined },
      { type: 'row', label: 'Right Front', targetValue: undefined },
      { type: 'row', label: 'Sleeves', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_granny_square',
    name: 'Granny Square',
    description: 'For granny square projects',
    category: 'blanket',
    counters: [
      { type: 'row', label: 'Rounds per Square', targetValue: undefined },
      { type: 'custom', label: 'Squares Completed', targetValue: undefined },
      { type: 'custom', label: 'Squares Total', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_shawl',
    name: 'Shawl',
    description: 'Triangle or rectangular shawl tracking',
    category: 'accessory',
    counters: [
      { type: 'row', label: 'Rows', targetValue: undefined },
      { type: 'stitch', label: 'Stitches (Widest Point)', targetValue: undefined },
      { type: 'custom', label: 'Increase/Decrease Count', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_socks',
    name: 'Socks',
    description: 'Pair of socks with matching counters',
    category: 'accessory',
    counters: [
      { type: 'row', label: 'Left Sock Rounds', targetValue: undefined },
      { type: 'row', label: 'Right Sock Rounds', targetValue: undefined },
      { type: 'stitch', label: 'Stitches per Round', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'preset_bag',
    name: 'Bag',
    description: 'Bag with base, sides, and handles',
    category: 'accessory',
    counters: [
      { type: 'row', label: 'Base Rounds', targetValue: undefined },
      { type: 'row', label: 'Side Rows', targetValue: undefined },
      { type: 'row', label: 'Handle Rows', targetValue: undefined },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];

export const useCounterPresetsStore = create<CounterPresetsState>()(
  persist(
    (set, get) => ({
      presets: defaultPresets,
      usage: {},
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
          usage: Object.fromEntries(
            Object.entries(state.usage || {}).filter(([key]) => key !== id)
          ),
        }));
      },
      getPresetsByCategory: (category) => {
        return get().presets.filter((preset) => preset.category === category);
      },
      recordUsage: (presetId, projectCategory) => {
        set((state) => {
          const currentUsage = state.usage?.[presetId] || {
            presetId,
            usageCount: 0,
            lastUsed: now(),
            categories: [],
          };
          return {
            usage: {
              ...state.usage,
              [presetId]: {
                ...currentUsage,
                usageCount: currentUsage.usageCount + 1,
                lastUsed: now(),
                categories: projectCategory
                  ? Array.from(new Set([...currentUsage.categories, projectCategory]))
                  : currentUsage.categories,
              },
            },
          };
        });
      },
      getMostUsedPresets: (limit = 5) => {
        const state = get();
        const sorted = Object.values(state.usage || {})
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
        return sorted
          .map((usage) => state.presets.find((p) => p.id === usage.presetId))
          .filter((p): p is CounterPreset => p !== undefined);
      },
      getSuggestedPresets: (projectCategory, patternName) => {
        const state = get();
        const suggestions: CounterPreset[] = [];
        
        // If project category matches preset category, prioritize those
        if (projectCategory) {
          const categoryMatch = state.presets.filter((p) => p.category === projectCategory);
          suggestions.push(...categoryMatch);
        }
        
        // Add most used presets
        const mostUsed = state.getMostUsedPresets(3);
        mostUsed.forEach((preset) => {
          if (!suggestions.find((p) => p.id === preset.id)) {
            suggestions.push(preset);
          }
        });
        
        // Pattern name matching (simple keyword matching)
        if (patternName) {
          const nameLower = patternName.toLowerCase();
          const nameMatches = state.presets.filter((p) => {
            const presetNameLower = p.name.toLowerCase();
            return nameLower.includes(presetNameLower) || presetNameLower.includes(nameLower);
          });
          nameMatches.forEach((preset) => {
            if (!suggestions.find((p) => p.id === preset.id)) {
              suggestions.unshift(preset); // Prioritize name matches
            }
          });
        }
        
        // Fill with defaults if needed
        if (suggestions.length < 5) {
          const defaults = state.presets.filter((p) => !suggestions.find((s) => s.id === p.id));
          suggestions.push(...defaults.slice(0, 5 - suggestions.length));
        }
        
        return suggestions.slice(0, 5);
      },
      exportPresets: () => {
        const state = get();
        const customPresets = state.presets.filter((p) => !p.id.startsWith('preset_'));
        const exportData = {
          version: '1.0.0',
          exportedAt: now(),
          presets: customPresets,
          usage: state.usage,
        };
        return JSON.stringify(exportData, null, 2);
      },
      importPresets: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (!data.presets || !Array.isArray(data.presets)) {
            return { imported: 0, errors: ['Invalid preset file format'] };
          }
          
          const errors: string[] = [];
          let imported = 0;
          
          set((state) => {
            const existingIds = new Set(state.presets.map((p) => p.id));
            const newPresets: CounterPreset[] = [];
            
            data.presets.forEach((preset: any, index: number) => {
              // Validate preset structure
              if (!preset.name || !preset.counters || !Array.isArray(preset.counters)) {
                errors.push(`Preset ${index + 1}: Invalid structure`);
                return;
              }
              
              // Generate new ID if preset already exists
              let presetId = preset.id;
              if (existingIds.has(presetId) || presetId.startsWith('preset_')) {
                presetId = generateId();
              }
              
              const importedPreset: CounterPreset = {
                id: presetId,
                name: preset.name.trim(),
                description: preset.description?.trim(),
                category: preset.category || 'custom',
                counters: preset.counters,
                createdAt: preset.createdAt || now(),
                updatedAt: now(),
              };
              
              newPresets.push(importedPreset);
              existingIds.add(presetId);
              imported++;
            });
            
            return {
              presets: [...state.presets, ...newPresets],
              usage: data.usage ? { ...state.usage, ...data.usage } : state.usage,
            };
          });
          
          return { imported, errors };
        } catch (error) {
          return { imported: 0, errors: [`Failed to parse JSON: ${error}`] };
        }
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

