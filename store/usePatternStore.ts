import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';
import { Pattern, PatternInput, PatternModification, PatternVersion, RowAnnotation } from '@/types/pattern';

type PatternState = {
  patterns: Pattern[];
  addPattern: (input: PatternInput) => Pattern;
  deletePattern: (id: string) => void;
  toggleRowChecklist: (patternId: string, rowId: string) => void;
  clearRowChecklist: (patternId: string) => void;
  // Phase 2.3: Annotations
  addRowAnnotation: (patternId: string, rowId: string, annotation: Omit<RowAnnotation, 'rowId' | 'createdAt' | 'modifiedAt'>) => void;
  updateRowAnnotation: (patternId: string, rowId: string, updates: Partial<RowAnnotation>) => void;
  removeRowAnnotation: (patternId: string, rowId: string) => void;
  // Phase 2.3: Modifications tracking
  trackModification: (patternId: string, modification: Omit<PatternModification, 'id' | 'timestamp'>) => void;
  createVersion: (patternId: string) => void;
  getVersion: (patternId: string, version: number) => PatternVersion | undefined;
  restoreVersion: (patternId: string, version: number) => void;
  // Phase 2.3: Pattern updates
  updatePattern: (patternId: string, updates: Partial<Pattern>) => void;
};

const now = () => new Date().toISOString();

const generateId = (prefix = 'pattern') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

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
      toggleRowChecklist: (patternId, rowId) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            
            const checklist = pattern.rowChecklist || [];
            const index = checklist.indexOf(rowId);
            
            if (index > -1) {
              // Remove if exists
              return {
                ...pattern,
                rowChecklist: checklist.filter((id) => id !== rowId),
              };
            } else {
              // Add if doesn't exist
              return {
                ...pattern,
                rowChecklist: [...checklist, rowId],
              };
            }
          }),
        }));
      },
      clearRowChecklist: (patternId) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            return {
              ...pattern,
              rowChecklist: [],
            };
          }),
        }));
      },
      // Phase 2.3: Annotations
      addRowAnnotation: (patternId, rowId, annotation) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            
            const annotations = pattern.rowAnnotations || {};
            const newAnnotation: RowAnnotation = {
              rowId,
              ...annotation,
              createdAt: now(),
            };
            
            return {
              ...pattern,
              rowAnnotations: {
                ...annotations,
                [rowId]: newAnnotation,
              },
            };
          }),
        }));
      },
      updateRowAnnotation: (patternId, rowId, updates) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            
            const annotations = pattern.rowAnnotations || {};
            const existing = annotations[rowId];
            if (!existing) return pattern;
            
            return {
              ...pattern,
              rowAnnotations: {
                ...annotations,
                [rowId]: {
                  ...existing,
                  ...updates,
                  modifiedAt: now(),
                },
              },
            };
          }),
        }));
      },
      removeRowAnnotation: (patternId, rowId) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            
            const annotations = pattern.rowAnnotations || {};
            const { [rowId]: removed, ...rest } = annotations;
            
            return {
              ...pattern,
              rowAnnotations: rest,
            };
          }),
        }));
      },
      // Phase 2.3: Modifications tracking
      trackModification: (patternId, modification) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            
            const modifications = pattern.modifications || [];
            const newModification: PatternModification = {
              ...modification,
              id: generateId('mod'),
              timestamp: now(),
            };
            
            return {
              ...pattern,
              modifications: [...modifications, newModification],
            };
          }),
        }));
      },
      createVersion: (patternId) => {
        set((state) => {
          const pattern = state.patterns.find((p) => p.id === patternId);
          if (!pattern) return state;
          
          const currentVersion = (pattern.currentVersion || 0) + 1;
          const newVersion: PatternVersion = {
            id: generateId('ver'),
            version: currentVersion,
            timestamp: now(),
            changes: pattern.modifications || [],
            snippet: pattern.snippet,
            annotations: pattern.rowAnnotations,
          };
          
          return {
            patterns: state.patterns.map((p) => {
              if (p.id !== patternId) return p;
              return {
                ...p,
                currentVersion,
                versions: [...(p.versions || []), newVersion],
                modifications: [], // Clear modifications after versioning
              };
            }),
          };
        });
      },
      getVersion: (patternId, version) => {
        const state = usePatternStore.getState();
        const pattern = state.patterns.find((p) => p.id === patternId);
        return pattern?.versions?.find((v) => v.version === version);
      },
      restoreVersion: (patternId, version) => {
        set((state) => {
          const pattern = state.patterns.find((p) => p.id === patternId);
          const versionToRestore = pattern?.versions?.find((v) => v.version === version);
          if (!versionToRestore) return state;
          
          return {
            patterns: state.patterns.map((p) => {
              if (p.id !== patternId) return p;
              return {
                ...p,
                snippet: versionToRestore.snippet,
                rowAnnotations: versionToRestore.annotations,
                modifications: [],
              };
            }),
          };
        });
      },
      // Phase 2.3: Pattern updates
      updatePattern: (patternId, updates) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) => {
            if (pattern.id !== patternId) return pattern;
            return {
              ...pattern,
              ...updates,
            };
          }),
        }));
      },
    }),
    {
      name: 'knotiq-patterns',
      storage: createJSONStorage(resolveStateStorage),
    },
  ),
);



