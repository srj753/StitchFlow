import type { ProjectFormPrefill } from '@/components/projects/ProjectForm';
import type { PatternDraft } from '@/store/usePatternDraftStore';

export const patternDraftToPreviewLines = (draft: PatternDraft): string[] => {
  const lines: string[] = [];
  lines.push(`${draft.title || 'Untitled pattern'} · ${capitalize(draft.difficulty)}`);

  if (draft.description) {
    lines.push(draft.description);
  }

  draft.sections.forEach((section) => {
    lines.push('');
    lines.push(section.name.toUpperCase());
    section.rows.forEach((row) => {
      const stitchMeta = row.stitchCount ? ` (${row.stitchCount})` : '';
      lines.push(`${row.label || 'Row'}: ${row.instruction || ''}${stitchMeta}`);
    });
  });

  if (draft.notes) {
    lines.push('');
    lines.push(`Notes: ${draft.notes}`);
  }

  return lines;
};

export const patternDraftToProjectPrefill = (draft: PatternDraft): ProjectFormPrefill => ({
  name: draft.title || 'Untitled pattern',
  patternName: draft.title,
  patternSourceType: 'my-pattern',
  notes: draft.notes || draft.description,
  snippet: patternDraftToPreviewLines(draft).join('\n'),
  yarnWeight: draft.yarnWeight || undefined,
  hookSize: parseHookSize(draft.hookSize),
  colorPalette: draft.palette,
});

const parseHookSize = (input?: string) => {
  if (!input) return undefined;
  const match = input.match(/[\d.]+/);
  return match ? match[0] : undefined;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

