import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Pattern } from '@/types/pattern';
import { parsePatternText } from './patternParser';
import { createPatternChangeSummary } from './patternSync';

/**
 * Exports pattern as text with annotations
 */
export function exportPatternAsText(pattern: Pattern): string {
  let output = `PATTERN: ${pattern.name}\n`;
  output += `Designer: ${pattern.designer}\n`;
  output += `Difficulty: ${pattern.difficulty}\n`;
  if (pattern.referenceUrl) {
    output += `Source: ${pattern.referenceUrl}\n`;
  }
  output += `\n${'='.repeat(50)}\n\n`;

  // Parse pattern text
  const parsedLines = parsePatternText(pattern.snippet || '');
  const annotations = pattern.rowAnnotations || {};
  const completedRows = pattern.rowChecklist || [];

  // Output pattern with annotations
  parsedLines.forEach((line) => {
    const annotation = annotations[line.id];
    const isCompleted = completedRows.includes(line.id);

    // Row number and text
    if (line.type === 'header') {
      output += `\n${line.text.toUpperCase()}\n`;
      output += `${'-'.repeat(50)}\n`;
    } else {
      let lineOutput = '';

      if (line.rowNumber) {
        lineOutput += `R${line.rowNumber}: `;
      }

      lineOutput += line.text;

      if (line.stitchCount) {
        lineOutput += ` (${line.stitchCount} sts)`;
      }

      // Add completion marker
      if (isCompleted) {
        lineOutput = `[✓] ${lineOutput}`;
      }

      // Add annotation markers
      if (annotation) {
        if (annotation.isCrossedOut) {
          lineOutput = `[X] ${lineOutput}`;
        }
        if (annotation.highlightColor) {
          lineOutput = `[HIGHLIGHT: ${annotation.highlightColor}] ${lineOutput}`;
        }
      }

      output += lineOutput + '\n';

      // Add annotation note
      if (annotation?.note) {
        output += `  └─ Note: ${annotation.note}\n`;
      }
    }
  });

  // Add summary
  if (Object.keys(annotations).length > 0 || pattern.modifications) {
    output += `\n${'='.repeat(50)}\n`;
    output += 'ANNOTATIONS & CHANGES\n';
    output += `${'='.repeat(50)}\n\n`;
    output += createPatternChangeSummary(pattern);
  }

  return output;
}

/**
 * Exports pattern as JSON with all metadata
 */
export function exportPatternAsJSON(pattern: Pattern): string {
  const exportData = {
    name: pattern.name,
    designer: pattern.designer,
    description: pattern.description,
    difficulty: pattern.difficulty,
    snippet: pattern.snippet,
    annotations: pattern.rowAnnotations,
    modifications: pattern.modifications,
    versions: pattern.versions,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports pattern as markdown for sharing
 */
export function exportPatternAsMarkdown(pattern: Pattern): string {
  let output = `# ${pattern.name}\n\n`;
  output += `**Designer:** ${pattern.designer}\n`;
  output += `**Difficulty:** ${pattern.difficulty}\n`;
  if (pattern.referenceUrl) {
    output += `**Source:** [${pattern.referenceUrl}](${pattern.referenceUrl})\n`;
  }
  output += `\n---\n\n`;

  // Parse pattern text
  const parsedLines = parsePatternText(pattern.snippet || '');
  const annotations = pattern.rowAnnotations || {};
  const completedRows = pattern.rowChecklist || [];

  // Output pattern
  parsedLines.forEach((line) => {
    const annotation = annotations[line.id];
    const isCompleted = completedRows.includes(line.id);

    if (line.type === 'header') {
      output += `\n## ${line.text}\n\n`;
    } else {
      let lineOutput = '';

      if (line.rowNumber) {
        lineOutput += `**R${line.rowNumber}:** `;
      }

      if (isCompleted) {
        lineOutput = `- [x] ${lineOutput}`;
      } else {
        lineOutput = `- [ ] ${lineOutput}`;
      }

      lineOutput += line.text;

      if (line.stitchCount) {
        lineOutput += ` *(${line.stitchCount} sts)*`;
      }

      // Add annotation info
      if (annotation) {
        if (annotation.isCrossedOut) {
          lineOutput = `~~${lineOutput}~~`;
        }
        if (annotation.note) {
          lineOutput += `\n  > ${annotation.note}`;
        }
      }

      output += lineOutput + '\n';
    }
  });

  // Add annotations section
  if (Object.keys(annotations).length > 0) {
    output += `\n---\n\n## Annotations\n\n`;
    Object.entries(annotations).forEach(([rowId, annotation]) => {
      if (annotation.note) {
        output += `- **Row ${rowId}:** ${annotation.note}\n`;
      }
    });
  }

  return output;
}

/**
 * Saves pattern export to file and shares it
 */
export async function sharePatternExport(
  pattern: Pattern,
  format: 'text' | 'json' | 'markdown' = 'text',
): Promise<void> {
  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case 'json':
      content = exportPatternAsJSON(pattern);
      filename = `${pattern.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
      mimeType = 'application/json';
      break;
    case 'markdown':
      content = exportPatternAsMarkdown(pattern);
      filename = `${pattern.name.replace(/[^a-z0-9]/gi, '_')}_export.md`;
      mimeType = 'text/markdown';
      break;
    default:
      content = exportPatternAsText(pattern);
      filename = `${pattern.name.replace(/[^a-z0-9]/gi, '_')}_export.txt`;
      mimeType = 'text/plain';
  }

  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  try {
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: `Share ${pattern.name}`,
      });
    } else {
      // Fallback: copy to clipboard or show content
      console.log('Sharing not available. File saved to:', fileUri);
    }
  } catch (error) {
    console.error('Error exporting pattern:', error);
    throw error;
  }
}


