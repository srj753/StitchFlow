import { PatternDifficulty } from '@/types/pattern';

export type ExtractedPatternData = {
  name?: string;
  designer?: string;
  description?: string;
  difficulty?: PatternDifficulty;
  yarnWeight?: string;
  hookSize?: string;
  stitches?: string[];
  materials?: string[];
  gauge?: string;
  size?: string;
  instructions?: string;
  notes?: string;
  tags?: string[];
};

/**
 * Smart pattern content extractor
 * Similar to how recipe apps extract structured data from text
 */
export function extractPatternData(text: string): ExtractedPatternData {
  const data: ExtractedPatternData = {};
  
  // Normalize text - remove extra whitespace, normalize line breaks
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Extract pattern name (usually first line or after "Pattern:" header)
  data.name = extractPatternName(normalized);
  
  // Extract designer (look for "Designer:", "By:", "Created by:", etc.)
  data.designer = extractDesigner(normalized);
  
  // Extract difficulty
  data.difficulty = extractDifficulty(normalized);
  
  // Extract yarn weight
  data.yarnWeight = extractYarnWeight(normalized);
  
  // Extract hook size
  data.hookSize = extractHookSize(normalized);
  
  // Extract stitches used
  data.stitches = extractStitches(normalized);
  
  // Extract materials
  data.materials = extractMaterials(normalized);
  
  // Extract gauge
  data.gauge = extractGauge(normalized);
  
  // Extract size
  data.size = extractSize(normalized);
  
  // Extract instructions (the main pattern text)
  data.instructions = extractInstructions(normalized);
  
  // Extract notes
  data.notes = extractNotes(normalized);
  
  // Generate description from available data
  data.description = generateDescription(data, normalized);
  
  return data;
}

/**
 * Extracts pattern name - usually the first significant line or after "Pattern:" header
 */
function extractPatternName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for "Pattern:" header
  const patternHeaderIndex = lines.findIndex(line => 
    /^pattern:?\s*/i.test(line)
  );
  
  if (patternHeaderIndex >= 0 && patternHeaderIndex < lines.length - 1) {
    const nameLine = lines[patternHeaderIndex + 1];
    if (nameLine.length > 3 && nameLine.length < 100) {
      return nameLine;
    }
  }
  
  // Use first line if it looks like a title (short, no special chars, capitalized)
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (
      firstLine.length > 3 &&
      firstLine.length < 80 &&
      !firstLine.toLowerCase().includes('designer') &&
      !firstLine.toLowerCase().includes('yarn') &&
      !firstLine.toLowerCase().includes('hook') &&
      !firstLine.toLowerCase().includes('materials') &&
      !/^\d+/.test(firstLine) // Doesn't start with a number
    ) {
      return firstLine;
    }
  }
  
  return undefined;
}

/**
 * Extracts designer name
 */
function extractDesigner(text: string): string | undefined {
  const designerPatterns = [
    /designer:?\s*(.+)/i,
    /by:?\s*(.+)/i,
    /created\s+by:?\s*(.+)/i,
    /pattern\s+by:?\s*(.+)/i,
    /designed\s+by:?\s*(.+)/i,
  ];
  
  for (const pattern of designerPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const designer = match[1].trim().split('\n')[0].trim();
      if (designer.length > 0 && designer.length < 100) {
        return designer;
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts difficulty level
 */
function extractDifficulty(text: string): PatternDifficulty | undefined {
  const lowerText = text.toLowerCase();
  
  if (/\b(beginner|easy|simple|basic)\b/i.test(lowerText)) {
    return 'beginner';
  }
  if (/\b(advanced|expert|complex|difficult)\b/i.test(lowerText)) {
    return 'advanced';
  }
  if (/\b(intermediate|medium|moderate)\b/i.test(lowerText)) {
    return 'intermediate';
  }
  
  return undefined;
}

/**
 * Extracts yarn weight
 */
function extractYarnWeight(text: string): string | undefined {
  const yarnPatterns = [
    /yarn:?\s*(.+?)(?:\n|hook|materials|gauge|instructions)/i,
    /yarn\s+weight:?\s*(.+?)(?:\n|hook|materials|gauge|instructions)/i,
    /\b(worsted|dk|sport|fingering|bulky|super\s+bulky|lace|aran|chunky)\b/i,
    /\b(4|5|6|7)\s+ply\b/i,
  ];
  
  for (const pattern of yarnPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const weight = match[1].trim().split('\n')[0].trim();
      if (weight.length > 0 && weight.length < 50) {
        // Clean up common patterns
        return weight
          .replace(/^.*?yarn:?\s*/i, '')
          .replace(/\s*\(.*?\)\s*/g, '')
          .trim();
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts hook size
 */
function extractHookSize(text: string): string | undefined {
  const hookPatterns = [
    /hook:?\s*(.+?)(?:\n|yarn|materials|gauge|instructions)/i,
    /hook\s+size:?\s*(.+?)(?:\n|yarn|materials|gauge|instructions)/i,
    /\b(\d+\.?\d*\s*mm)\b/i,
    /\b([A-Z]\/\d+)\b/, // US sizes like H/8
    /\b(\d+\.?\d*\s*mm\s*hook)\b/i,
  ];
  
  for (const pattern of hookPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const hook = match[1].trim().split('\n')[0].trim();
      if (hook.length > 0 && hook.length < 20) {
        return hook;
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts stitches used (common crochet abbreviations)
 */
function extractStitches(text: string): string[] {
  const stitchAbbreviations = [
    'sc', 'hdc', 'dc', 'tr', 'tc', 'dtr',
    'inc', 'dec', 'sc2tog', 'dc2tog',
    'fpdc', 'bpdc', 'fpsc', 'bpsc',
    'bobble', 'puff', 'popcorn', 'cluster',
    'BLO', 'FLO', 'MR', 'ch', 'sl st',
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const stitch of stitchAbbreviations) {
    const regex = new RegExp(`\\b${stitch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.push(stitch);
    }
  }
  
  return found;
}

/**
 * Extracts materials list
 */
function extractMaterials(text: string): string[] {
  const materialsSection = extractSection(text, /materials?:?/i);
  if (!materialsSection) return [];
  
  const lines = materialsSection.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.match(/^[-•*]\s*$/));
  
  return lines.slice(0, 10); // Limit to first 10 items
}

/**
 * Extracts gauge information
 */
function extractGauge(text: string): string | undefined {
  const gaugePatterns = [
    /gauge:?\s*(.+?)(?:\n\n|instructions|materials|size)/i,
    /\b(\d+\s*(?:sts?|stitches?)\s*=\s*\d+\s*(?:inches?|cm|"|'))\b/i,
    /\b(\d+\s*(?:inches?|cm)\s*=\s*\d+\s*(?:sts?|stitches?))\b/i,
  ];
  
  for (const pattern of gaugePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const gauge = match[1].trim().split('\n')[0].trim();
      if (gauge.length > 0 && gauge.length < 100) {
        return gauge;
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts size information
 */
function extractSize(text: string): string | undefined {
  const sizePatterns = [
    /size:?\s*(.+?)(?:\n\n|instructions|materials|gauge)/i,
    /finished\s+size:?\s*(.+?)(?:\n\n|instructions|materials|gauge)/i,
    /\b(small|medium|large|xs|xl|xxl|one\s+size)\b/i,
  ];
  
  for (const pattern of sizePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const size = match[1].trim().split('\n')[0].trim();
      if (size.length > 0 && size.length < 50) {
        return size;
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts main pattern instructions
 */
function extractInstructions(text: string): string | undefined {
  // Look for instruction sections
  const instructionHeaders = [
    /instructions?:?/i,
    /pattern:?/i,
    /directions?:?/i,
    /steps?:?/i,
  ];
  
  for (const header of instructionHeaders) {
    const section = extractSection(text, header);
    if (section) {
      // Clean up the section
      const cleaned = section
        .replace(/^instructions?:?\s*/i, '')
        .replace(/^pattern:?\s*/i, '')
        .trim();
      
      if (cleaned.length > 20) {
        return cleaned;
      }
    }
  }
  
  // If no clear instruction section, try to find the main pattern content
  // Usually after materials/gauge sections
  const afterMaterials = text.split(/materials?:?|gauge:?/i);
  if (afterMaterials.length > 1) {
    const potentialInstructions = afterMaterials[afterMaterials.length - 1]
      .split(/\n\n+/)[0]
      .trim();
    
    if (potentialInstructions.length > 50) {
      return potentialInstructions;
    }
  }
  
  // Fallback: return text after first few lines (assuming they're metadata)
  const lines = text.split('\n');
  if (lines.length > 5) {
    const mainContent = lines.slice(5).join('\n').trim();
    if (mainContent.length > 50) {
      return mainContent;
    }
  }
  
  return undefined;
}

/**
 * Extracts notes section
 */
function extractNotes(text: string): string | undefined {
  const notesSection = extractSection(text, /notes?:?/i);
  if (!notesSection) return undefined;
  
  return notesSection
    .replace(/^notes?:?\s*/i, '')
    .trim();
}

/**
 * Extracts a section of text following a header
 */
function extractSection(text: string, headerPattern: RegExp): string | undefined {
  const match = text.match(headerPattern);
  if (!match) return undefined;
  
  const startIndex = match.index! + match[0].length;
  const remainingText = text.substring(startIndex).trim();
  
  // Find the next major section or end of text
  const nextSectionPattern = /\n\n+(?:materials?:?|gauge:?|size:?|instructions?:?|pattern:?|notes?:?)/i;
  const nextMatch = remainingText.match(nextSectionPattern);
  
  if (nextMatch) {
    return remainingText.substring(0, nextMatch.index).trim();
  }
  
  return remainingText.trim();
}

/**
 * Generates a description from extracted data
 */
function generateDescription(data: ExtractedPatternData, originalText: string): string | undefined {
  const parts: string[] = [];
  
  if (data.yarnWeight) {
    parts.push(data.yarnWeight);
  }
  if (data.hookSize) {
    parts.push(`Hook: ${data.hookSize}`);
  }
  if (data.size) {
    parts.push(`Size: ${data.size}`);
  }
  
  if (parts.length > 0) {
    return parts.join(' • ');
  }
  
  // Fallback: use first few sentences of instructions
  if (data.instructions) {
    const sentences = data.instructions.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      return sentences[0].trim() + '.';
    }
  }
  
  return undefined;
}



