import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';
import { Pattern, PatternInput } from '@/types/pattern';

type PatternState = {
  patterns: Pattern[];
  addPattern: (input: PatternInput) => Pattern;
  deletePattern: (id: string) => void;
};

const now = () => new Date().toISOString();

const generateId = () =>
  `pattern_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const createPattern = (input: PatternInput): Pattern => ({
  id: generateId(),
  name: input.name.trim(),
  designer: input.designer?.trim() ?? 'Unknown designer',
  description: input.description.trim(),
  difficulty: input.difficulty,
  duration: input.duration ?? 'Varies',
  yarnWeight: input.yarnWeight ?? 'Unknown',
  hookSize: input.hookSize ?? 'n/a',
  stitches: input.stitches ?? [],
  moods: input.moods ?? [],
  tags: input.tags ?? [],
  palette: input.palette ?? ['#F9F8F3', '#D1E9E3', '#FDE4CF'],
  referenceUrl: input.referenceUrl?.trim(),
  fileUri: input.fileUri,
  snippet: input.snippet,
  estimatedRounds: undefined,
  targetHeightInches: undefined,
  notes: input.notes,
  patternSourceType: input.patternSourceType ?? 'external',
  sourceType: 'imported',
  importedAt: now(),
});

export const usePatternStore = create<PatternState>()(
  persist(
    (set) => ({
      patterns: [],
      addPattern: (input) => {
        const pattern = createPattern(input);
        set((state) => ({
          patterns: [pattern, ...state.patterns],
        }));
        return pattern;
      },
      deletePattern: (id) => {
        set((state) => ({
          patterns: state.patterns.filter((pattern) => pattern.id !== id),
        }));
      },
    }),
    {
      name: 'knotiq-patterns',
      storage: createJSONStorage(resolveStateStorage),
    },
  ),
);



