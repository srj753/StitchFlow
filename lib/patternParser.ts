/**
 * Placeholder utilities for future pattern parsing / AI.
 * TODO: Implement structured parsing for PDFs and web pages.
 */

export type ParsedPatternSection = {
  name: string;
  rows: Array<{
    label: string;
    instruction: string;
    stitchCount?: string;
  }>;
};

export type ParsedPattern = {
  title: string;
  materials: string[];
  sections: ParsedPatternSection[];
  stitchesDetected: string[];
};

export async function parsePatternFromText(_input: string): Promise<ParsedPattern | null> {
  // TODO: Run NLP pipeline to extract sections, repeats, and stitches.
  return null;
}

export async function parsePatternFromPdf(_uri: string): Promise<ParsedPattern | null> {
  // TODO: Use PDF parsing service or on-device OCR for offline mode.
  return null;
}



