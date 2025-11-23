import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';
import { Pattern } from '@/types/pattern';

const generateId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const now = () => new Date().toISOString();

export type PatternRowDraft = {
  id: string;
  label: string;
  instruction: string;
  stitchCount?: string;
};

export type PatternSectionDraft = {
  id: string;
  name: string;
  rows: PatternRowDraft[];
};

export type PatternDraft = {
  title: string;
  description: string;
  difficulty: Pattern['difficulty'];
  yarnWeight: string;
  hookSize: string;
  gauge: string;
  tags: string[];
  notes: string;
  palette: string[];
  sections: PatternSectionDraft[];
  updatedAt: string;
};

type RowTemplate = Partial<Omit<PatternRowDraft, 'id'>>;

type PatternDraftState = {
  draft: PatternDraft;
  setMeta: (data: Partial<Omit<PatternDraft, 'sections' | 'tags' | 'palette'>>) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  updatePaletteColor: (index: number, color: string) => void;
  addPaletteColor: (color?: string) => void;
  removePaletteColor: (index: number) => void;
  addSection: (name?: string) => void;
  updateSectionName: (sectionId: string, name: string) => void;
  deleteSection: (sectionId: string) => void;
  addRow: (sectionId: string, template?: RowTemplate) => void;
  updateRow: (sectionId: string, rowId: string, data: Partial<PatternRowDraft>) => void;
  deleteRow: (sectionId: string, rowId: string) => void;
  duplicateRow: (sectionId: string, rowId: string) => void;
  loadPattern: (pattern: Pattern) => void;
  resetDraft: () => void;
};

const createDefaultDraft = (): PatternDraft => {
  const baseSectionId = generateId('section');
  return {
    title: 'Freestyle plush draft',
    description: 'Sketch motifs, rounds, or garment sections. Everything autosaves.',
    difficulty: 'beginner',
    yarnWeight: 'Worsted 4',
    hookSize: '4.0 mm',
    gauge: '4" = 14 sc',
    tags: ['plush', 'experiment'],
    notes: '',
    palette: ['#F68AAF', '#FFC8DD', '#F5A3C7'],
    sections: [
      {
        id: baseSectionId,
        name: 'Body',
        rows: [
          {
            id: generateId('row'),
            label: 'Rnd 1',
            instruction: 'MR, 6 sc',
            stitchCount: '6 sts',
          },
          {
            id: generateId('row'),
            label: 'Rnd 2',
            instruction: 'inc around',
            stitchCount: '12 sts',
          },
        ],
      },
    ],
    updatedAt: now(),
  };
};

const storageResolver = () => resolveStateStorage();

export const usePatternDraftStore = create<PatternDraftState>()(
  persist(
    (set, get) => ({
      draft: createDefaultDraft(),
      setMeta: (data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...data,
            updatedAt: now(),
          },
        })),
      setTags: (tags) =>
        set((state) => ({
          draft: {
            ...state.draft,
            tags: [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))],
            updatedAt: now(),
          },
        })),
      addTag: (tag) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        set((state) => ({
          draft: {
            ...state.draft,
            tags: state.draft.tags.includes(trimmed)
              ? state.draft.tags
              : [...state.draft.tags, trimmed],
            updatedAt: now(),
          },
        }));
      },
      removeTag: (tag) =>
        set((state) => ({
          draft: {
            ...state.draft,
            tags: state.draft.tags.filter((existing) => existing !== tag),
            updatedAt: now(),
          },
        })),
      updatePaletteColor: (index, color) =>
        set((state) => ({
          draft: {
            ...state.draft,
            palette: state.draft.palette.map((existing, idx) =>
              idx === index ? color : existing,
            ),
            updatedAt: now(),
          },
        })),
      addPaletteColor: (color = '#F5F5F5') =>
        set((state) => ({
          draft: {
            ...state.draft,
            palette:
              state.draft.palette.length >= 6
                ? state.draft.palette
                : [...state.draft.palette, color],
            updatedAt: now(),
          },
        })),
      removePaletteColor: (index) =>
        set((state) => ({
          draft: {
            ...state.draft,
            palette: state.draft.palette.filter((_, idx) => idx !== index),
            updatedAt: now(),
          },
        })),
      addSection: (name) =>
        set((state) => ({
          draft: {
            ...state.draft,
            sections: [
              ...state.draft.sections,
              {
                id: generateId('section'),
                name: name?.trim() || `Section ${state.draft.sections.length + 1}`,
                rows: [
                  {
                    id: generateId('row'),
                    label: 'Row 1',
                    instruction: '',
                  },
                ],
              },
            ],
            updatedAt: now(),
          },
        })),
      updateSectionName: (sectionId, name) =>
        set((state) => ({
          draft: {
            ...state.draft,
            sections: state.draft.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    name,
                  }
                : section,
            ),
            updatedAt: now(),
          },
        })),
      deleteSection: (sectionId) =>
        set((state) => {
          const remaining = state.draft.sections.filter((section) => section.id !== sectionId);
          return {
            draft: {
              ...state.draft,
              sections: remaining.length > 0 ? remaining : createDefaultDraft().sections,
              updatedAt: now(),
            },
          };
        }),
      addRow: (sectionId, template) =>
        set((state) => ({
          draft: {
            ...state.draft,
            sections: state.draft.sections.map((section) => {
              if (section.id !== sectionId) return section;
              const nextIndex = section.rows.length + 1;
              return {
                ...section,
                rows: [
                  ...section.rows,
                  {
                    id: generateId('row'),
                    label: template?.label ?? `Row ${nextIndex}`,
                    instruction: template?.instruction ?? '',
                    stitchCount: template?.stitchCount,
                  },
                ],
              };
            }),
            updatedAt: now(),
          },
        })),
      updateRow: (sectionId, rowId, data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            sections: state.draft.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    rows: section.rows.map((row) =>
                      row.id === rowId
                        ? {
                            ...row,
                            ...data,
                          }
                        : row,
                    ),
                  }
                : section,
            ),
            updatedAt: now(),
          },
        })),
      deleteRow: (sectionId, rowId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            sections: state.draft.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    rows:
                      section.rows.length <= 1
                        ? section.rows
                        : section.rows.filter((row) => row.id !== rowId),
                  }
                : section,
            ),
            updatedAt: now(),
          },
        })),
      duplicateRow: (sectionId, rowId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            sections: state.draft.sections.map((section) => {
              if (section.id !== sectionId) return section;
              const targetRow = section.rows.find((row) => row.id === rowId);
              if (!targetRow) return section;
              const clone: PatternRowDraft = {
                ...targetRow,
                id: generateId('row'),
                label: `${targetRow.label} (copy)`,
              };
              return {
                ...section,
                rows: [...section.rows, clone],
              };
            }),
            updatedAt: now(),
          },
        })),
      loadPattern: (pattern) =>
        set(() => ({
          draft: {
            title: pattern.name,
            description: pattern.description,
            difficulty: pattern.difficulty,
            yarnWeight: pattern.yarnWeight,
            hookSize: pattern.hookSize,
            gauge: '',
            tags: pattern.tags,
            notes: pattern.notes ?? '',
            palette: pattern.palette,
            sections: [
              {
                id: generateId('section'),
                name: 'Main section',
                rows: buildRowsFromPattern(pattern),
              },
            ],
            updatedAt: now(),
          },
        })),
      resetDraft: () =>
        set(() => ({
          draft: createDefaultDraft(),
        })),
    }),
    {
      name: 'knotiq-pattern-draft',
      storage: createJSONStorage(storageResolver),
      version: 1,
    },
  ),
);

function buildRowsFromPattern(pattern: Pattern): PatternRowDraft[] {
  const rows: PatternRowDraft[] = [];
  if (pattern.snippet) {
    pattern.snippet
      .split(/[\n.]/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line, index) => {
        rows.push({
          id: generateId('row'),
          label: `Row ${index + 1}`,
          instruction: line,
        });
      });
  } else if (pattern.stitches.length > 0) {
    pattern.stitches.forEach((stitch, index) => {
      rows.push({
        id: generateId('row'),
        label: `Row ${index + 1}`,
        instruction: stitch,
      });
    });
  } else {
    rows.push({
      id: generateId('row'),
      label: 'Row 1',
      instruction: 'Write your first instruction here.',
    });
  }

  return rows;
}

