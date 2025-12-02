import { Pattern, RowAnnotation } from '@/types/pattern';
import { Project } from '@/types/project';

/**
 * Converts pattern annotations to project journal entries
 */
export function syncAnnotationsToProject(
  pattern: Pattern,
  project: Project,
): Array<{ text: string; timestamp: string }> {
  const annotations = pattern.rowAnnotations || {};
  const entries: Array<{ text: string; timestamp: string }> = [];

  Object.entries(annotations).forEach(([rowId, annotation]) => {
    if (annotation.note) {
      entries.push({
        text: `[Pattern Row ${rowId}] ${annotation.note}`,
        timestamp: annotation.createdAt,
      });
    }
  });

  return entries;
}

/**
 * Syncs pattern checklist with project counters
 */
export function syncChecklistToCounters(
  pattern: Pattern,
  project: Project,
): { counterName: string; value: number } | null {
  const checklist = pattern.rowChecklist || [];
  const completedRows = checklist.length;

  if (completedRows === 0) return null;

  // Find or create a row counter
  const rowCounter = project.counters.find((c) => c.label.toLowerCase().includes('row'));
  
  return {
    counterName: rowCounter?.label || 'Rows',
    value: completedRows,
  };
}

/**
 * Converts pattern modifications to project notes
 */
export function syncModificationsToProject(
  pattern: Pattern,
  project: Project,
): Array<{ text: string; timestamp: string }> {
  const modifications = pattern.modifications || [];
  const entries: Array<{ text: string; timestamp: string }> = [];

  modifications.forEach((mod) => {
    entries.push({
      text: `[Pattern Change] ${mod.description}`,
      timestamp: mod.timestamp,
    });
  });

  return entries;
}

/**
 * Syncs all pattern data to project
 */
export function syncPatternToProject(pattern: Pattern, project: Project): {
  journalEntries: Array<{ text: string; timestamp: string }>;
  counterUpdate?: { counterName: string; value: number };
} {
  const journalEntries = [
    ...syncAnnotationsToProject(pattern, project),
    ...syncModificationsToProject(pattern, project),
  ];

  const counterUpdate = syncChecklistToCounters(pattern, project);

  return {
    journalEntries,
    counterUpdate,
  };
}

/**
 * Creates a summary of pattern changes for export
 */
export function createPatternChangeSummary(pattern: Pattern): string {
  const modifications = pattern.modifications || [];
  const annotations = pattern.rowAnnotations || {};
  const annotationCount = Object.keys(annotations).length;

  let summary = `Pattern: ${pattern.name}\n`;
  summary += `Total modifications: ${modifications.length}\n`;
  summary += `Total annotations: ${annotationCount}\n\n`;

  if (modifications.length > 0) {
    summary += 'Recent Changes:\n';
    modifications.slice(-5).forEach((mod) => {
      summary += `- ${mod.timestamp}: ${mod.description}\n`;
    });
    summary += '\n';
  }

  if (annotationCount > 0) {
    summary += 'Annotations:\n';
    Object.entries(annotations).forEach(([rowId, annotation]) => {
      if (annotation.note) {
        summary += `Row ${rowId}: ${annotation.note}\n`;
      }
    });
  }

  return summary;
}








