import { detectStitches } from './stitchDetector';

export type PatternLine = {
  id: string;
  text: string;
  type: 'instruction' | 'header' | 'note';
  isCompleted: boolean;
  originalIndex: number;
  rowNumber?: number;
  stitchCount?: number;
  detectedStitches?: Array<{
    abbreviation: string;
    fullName: string;
    type: string;
    startIndex: number;
    endIndex: number;
  }>;
};

export type PatternSection = {
  id: string;
  name: string;
  startLine: number;
  endLine: number;
  lines: PatternLine[];
};

export type PatternStructure = {
  sections: PatternSection[];
  totalRows: number;
  detectedStitches: Set<string>;
  hasRepeats: boolean;
  validationErrors: ValidationError[];
};

export type ValidationError = {
  line: number;
  type: 'syntax' | 'missing_number' | 'unclear_instruction' | 'incomplete_repeat';
  message: string;
  suggestion?: string;
};

/**
 * Enhanced pattern parsing with row extraction, structure analysis, and validation
 */
export function parsePatternText(text: string): PatternLine[] {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const parsedLines: PatternLine[] = [];

  // Enhanced regex for row/round identification - supports multiple formats
  // Matches: "R1:", "Row 1:", "Round 5", "Rnd 3:", "R.1", "Row 1-5", etc.
  const rowNumberRegex = /(?:^|\s)(?:Row|Round|Rnd|R)[\s.]*(\d+)(?:[-–]\d+)?[:.]?/i;
  
  // Regex for likely section headers
  const headerRegex = /^\s*(?:Body|Sleeves|Head|Tail|Legs|Ears|Wings|Assembly|Notes|Materials|Gauge|Size)[:]?\s*$/i;

  // Regex to detect stitch counts in parentheses: (12), (18 sts), etc.
  const stitchCountRegex = /\((\d+)\s*(?:sts?|stitches?)?\)/i;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let type: PatternLine['type'] = 'note';
    let rowNumber: number | undefined;
    let stitchCount: number | undefined;

    // Extract row number
    const rowMatch = trimmed.match(rowNumberRegex);
    if (rowMatch) {
      rowNumber = parseInt(rowMatch[1], 10);
    }

    // Extract stitch count
    const stitchCountMatch = trimmed.match(stitchCountRegex);
    if (stitchCountMatch) {
      stitchCount = parseInt(stitchCountMatch[1], 10);
    }

    // Detect stitches in the line
    const detectedStitches = detectStitches(trimmed).map((match) => ({
      abbreviation: match.stitch.abbreviation,
      fullName: match.stitch.fullName,
      type: match.stitch.type,
      startIndex: match.startIndex,
      endIndex: match.endIndex,
    }));

    if (headerRegex.test(trimmed)) {
      type = 'header';
    } else if (rowNumberRegex.test(trimmed)) {
      type = 'instruction';
    } else if (trimmed.length < 50 && trimmed.endsWith(':')) {
      // Catch-all for other headers like "Materials:"
      type = 'header';
    }

    parsedLines.push({
      id: `line-${index}-${Date.now()}`,
      text: trimmed,
      type,
      isCompleted: false,
      originalIndex: index,
      rowNumber,
      stitchCount,
      detectedStitches: detectedStitches.length > 0 ? detectedStitches : undefined,
    });
  });

  return parsedLines;
}

/**
 * Analyzes pattern structure: sections, repeats, stitch counts
 */
export function analyzePatternStructure(lines: PatternLine[]): PatternStructure {
  const sections: PatternSection[] = [];
  const detectedStitches = new Set<string>();
  const sectionData: Array<{ start: number; name: string; lines: PatternLine[] }> = [];
  let currentSectionStart = 0;
  let currentSectionName = 'Main Pattern';
  let totalRows = 0;
  let hasRepeats = false;

  lines.forEach((line, index) => {
    // Track detected stitches
    if (line.detectedStitches) {
      line.detectedStitches.forEach((s) => detectedStitches.add(s.abbreviation));
    }

    // Track row numbers
    if (line.rowNumber) {
      totalRows = Math.max(totalRows, line.rowNumber);
    }

    // Detect repeats
    if (/\brepeat\b|\bx\d+\b|\b\(\s*.*\s*\)\s*x\d+/i.test(line.text)) {
      hasRepeats = true;
    }

    // Identify sections
    if (line.type === 'header') {
      // Close previous section
      if (index > currentSectionStart) {
        sectionData.push({
          start: currentSectionStart,
          name: currentSectionName,
          lines: lines.slice(currentSectionStart, index).filter((l) => l.type !== 'header'),
        });
      }

      // Start new section
      currentSectionStart = index;
      currentSectionName = line.text.replace(/[:.]$/, '');
    }
  });

  // Close last section
  if (currentSectionStart < lines.length) {
    sectionData.push({
      start: currentSectionStart,
      name: currentSectionName,
      lines: lines.slice(currentSectionStart).filter((l) => l.type !== 'header'),
    });
  }

  // Convert to PatternSection format
  sectionData.forEach((data, idx) => {
    const endLine = idx < sectionData.length - 1 
      ? sectionData[idx + 1].start - 1 
      : lines.length - 1;
    
    sections.push({
      id: `section-${idx}`,
      name: data.name,
      startLine: data.start,
      endLine,
      lines: data.lines,
    });
  });

  // If no sections found, create a default one
  if (sections.length === 0) {
    sections.push({
      id: 'section-0',
      name: 'Main Pattern',
      startLine: 0,
      endLine: lines.length - 1,
      lines: lines.filter((l) => l.type !== 'header'),
    });
  }

  // Validate pattern
  const validationErrors = validatePattern(lines);

  return {
    sections,
    totalRows,
    detectedStitches,
    hasRepeats,
    validationErrors,
  };
}

/**
 * Validates pattern syntax and checks for common errors
 */
export function validatePattern(lines: PatternLine[]): ValidationError[] {
  const errors: ValidationError[] = [];

  lines.forEach((line, index) => {
    // Check for incomplete repeats
    if (/\brepeat\b/i.test(line.text) && !/\brepeat\s+(?:around|to\s+end|x\d+)/i.test(line.text)) {
      errors.push({
        line: index,
        type: 'incomplete_repeat',
        message: 'Incomplete repeat instruction',
        suggestion: 'Specify how many times to repeat (e.g., "repeat around" or "x6")',
      });
    }

    // Check for unclear instructions
    if (line.type === 'instruction' && line.text.length < 5) {
      errors.push({
        line: index,
        type: 'unclear_instruction',
        message: 'Instruction seems too short or unclear',
        suggestion: 'Add more detail to the instruction',
      });
    }

    // Check for missing stitch counts in increase/decrease rounds
    if (line.type === 'instruction') {
      const hasInc = /\binc\b/i.test(line.text);
      const hasDec = /\bdec\b/i.test(line.text);
      const hasStitchCount = line.stitchCount !== undefined;

      if ((hasInc || hasDec) && !hasStitchCount && !/\baround\b/i.test(line.text)) {
        errors.push({
          line: index,
          type: 'missing_number',
          message: 'Increase/decrease instruction missing stitch count',
          suggestion: 'Add stitch count in parentheses, e.g., "(12 sts)"',
        });
      }
    }

    // Check for syntax issues (unmatched parentheses)
    const openParens = (line.text.match(/\(/g) || []).length;
    const closeParens = (line.text.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        line: index,
        type: 'syntax',
        message: 'Unmatched parentheses',
        suggestion: 'Check for missing opening or closing parentheses',
      });
    }
  });

  return errors;
}

/**
 * Simulates extracting main content from a webpage HTML string.
 * In a real app, this would use a DOM parser (like cheerio) on the backend or a specialized library.
 * For now, we assume the user pastes the "Reader View" text or we do basic cleanup.
 */
export function cleanWebText(htmlOrText: string): string {
  // Basic cleanup placeholder
  return htmlOrText
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}
