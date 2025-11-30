export type PatternLine = {
  id: string;
  text: string;
  type: 'instruction' | 'header' | 'note';
  isCompleted: boolean;
  originalIndex: number;
};

export function parsePatternText(text: string): PatternLine[] {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const parsedLines: PatternLine[] = [];

  // Regex to identify instruction lines (e.g., "R1:", "Row 1", "Round 5:")
  // Looks for start of line, optional whitespace, "Row"/"Round"/"R", optional number, colon or period
  const instructionRegex = /^\s*(?:Row|Round|R)\s*\d+[:.]?/i;
  
  // Regex for likely section headers
  const headerRegex = /^\s*(?:Body|Sleeves|Head|Tail|Legs|Ears|Wings|Assembly|Notes)[:]?\s*$/i;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let type: PatternLine['type'] = 'note';

    if (headerRegex.test(trimmed)) {
      type = 'header';
    } else if (instructionRegex.test(trimmed)) {
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
    });
  });

  return parsedLines;
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
