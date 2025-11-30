/**
 * Stitch Detection and Highlighting
 * Detects common crochet stitch abbreviations and provides color-coding
 */

export type StitchType = 
  | 'basic'      // sc, hdc, dc, tc, etc.
  | 'increase'   // inc, 2sc, etc.
  | 'decrease'   // dec, sc2tog, etc.
  | 'special'    // bobble, puff, popcorn, etc.
  | 'post'       // fpdc, bpdc, etc.
  | 'loop'       // BLO, FLO, etc.
  | 'other';     // ch, sl st, etc.

export type DetectedStitch = {
  abbreviation: string;
  fullName: string;
  type: StitchType;
  color: string;
  pattern: RegExp;
};

/**
 * Common crochet stitch abbreviations with their full names and types
 */
export const STITCH_DICTIONARY: DetectedStitch[] = [
  // Basic stitches
  { abbreviation: 'sc', fullName: 'single crochet', type: 'basic', color: '#4A90E2', pattern: /\bsc\b/gi },
  { abbreviation: 'hdc', fullName: 'half double crochet', type: 'basic', color: '#50C878', pattern: /\bhdc\b/gi },
  { abbreviation: 'dc', fullName: 'double crochet', type: 'basic', color: '#9B59B6', pattern: /\bdc\b/gi },
  { abbreviation: 'tr', fullName: 'treble crochet', type: 'basic', color: '#E67E22', pattern: /\btr\b/gi },
  { abbreviation: 'tc', fullName: 'treble crochet', type: 'basic', color: '#E67E22', pattern: /\btc\b/gi },
  { abbreviation: 'dtr', fullName: 'double treble crochet', type: 'basic', color: '#E74C3C', pattern: /\bdtr\b/gi },
  
  // Increases
  { abbreviation: 'inc', fullName: 'increase', type: 'increase', color: '#2ECC71', pattern: /\binc\b/gi },
  { abbreviation: '2sc', fullName: '2 single crochet in same stitch', type: 'increase', color: '#2ECC71', pattern: /\b2sc\b/gi },
  { abbreviation: '2dc', fullName: '2 double crochet in same stitch', type: 'increase', color: '#2ECC71', pattern: /\b2dc\b/gi },
  { abbreviation: '3sc', fullName: '3 single crochet in same stitch', type: 'increase', color: '#2ECC71', pattern: /\b3sc\b/gi },
  
  // Decreases
  { abbreviation: 'dec', fullName: 'decrease', type: 'decrease', color: '#E74C3C', pattern: /\bdec\b/gi },
  { abbreviation: 'sc2tog', fullName: 'single crochet 2 together', type: 'decrease', color: '#E74C3C', pattern: /\bsc2tog\b/gi },
  { abbreviation: 'dc2tog', fullName: 'double crochet 2 together', type: 'decrease', color: '#E74C3C', pattern: /\bdc2tog\b/gi },
  { abbreviation: 'inv dec', fullName: 'invisible decrease', type: 'decrease', color: '#E74C3C', pattern: /\binv\s+dec\b/gi },
  { abbreviation: 'invisible dec', fullName: 'invisible decrease', type: 'decrease', color: '#E74C3C', pattern: /\binvisible\s+dec\b/gi },
  
  // Special stitches
  { abbreviation: 'bobble', fullName: 'bobble stitch', type: 'special', color: '#F39C12', pattern: /\bbobble\b/gi },
  { abbreviation: 'puff', fullName: 'puff stitch', type: 'special', color: '#F39C12', pattern: /\bpuff\b/gi },
  { abbreviation: 'popcorn', fullName: 'popcorn stitch', type: 'special', color: '#F39C12', pattern: /\bpopcorn\b/gi },
  { abbreviation: 'cluster', fullName: 'cluster stitch', type: 'special', color: '#F39C12', pattern: /\bcluster\b/gi },
  
  // Post stitches
  { abbreviation: 'fpdc', fullName: 'front post double crochet', type: 'post', color: '#8E44AD', pattern: /\bfpdc\b/gi },
  { abbreviation: 'bpdc', fullName: 'back post double crochet', type: 'post', color: '#8E44AD', pattern: /\bbpdc\b/gi },
  { abbreviation: 'fpsc', fullName: 'front post single crochet', type: 'post', color: '#8E44AD', pattern: /\bfpsc\b/gi },
  { abbreviation: 'bpsc', fullName: 'back post single crochet', type: 'post', color: '#8E44AD', pattern: /\bbpsc\b/gi },
  { abbreviation: 'front post', fullName: 'front post', type: 'post', color: '#8E44AD', pattern: /\bfront\s+post\b/gi },
  { abbreviation: 'back post', fullName: 'back post', type: 'post', color: '#8E44AD', pattern: /\bback\s+post\b/gi },
  
  // Loop stitches
  { abbreviation: 'BLO', fullName: 'back loop only', type: 'loop', color: '#16A085', pattern: /\bBLO\b/gi },
  { abbreviation: 'FLO', fullName: 'front loop only', type: 'loop', color: '#16A085', pattern: /\bFLO\b/gi },
  { abbreviation: 'back loop', fullName: 'back loop only', type: 'loop', color: '#16A085', pattern: /\bback\s+loop\b/gi },
  { abbreviation: 'front loop', fullName: 'front loop only', type: 'loop', color: '#16A085', pattern: /\bfront\s+loop\b/gi },
  
  // Other common stitches
  { abbreviation: 'ch', fullName: 'chain', type: 'other', color: '#95A5A6', pattern: /\bch\b/gi },
  { abbreviation: 'sl st', fullName: 'slip stitch', type: 'other', color: '#95A5A6', pattern: /\bsl\s+st\b/gi },
  { abbreviation: 'slip st', fullName: 'slip stitch', type: 'other', color: '#95A5A6', pattern: /\bslip\s+st\b/gi },
  { abbreviation: 'MR', fullName: 'magic ring', type: 'other', color: '#34495E', pattern: /\bMR\b/gi },
  { abbreviation: 'magic ring', fullName: 'magic ring', type: 'other', color: '#34495E', pattern: /\bmagic\s+ring\b/gi },
  { abbreviation: 'magic circle', fullName: 'magic circle', type: 'other', color: '#34495E', pattern: /\bmagic\s+circle\b/gi },
];

/**
 * Detects all stitches in a text string
 */
export function detectStitches(text: string): Array<{
  stitch: DetectedStitch;
  match: RegExpMatchArray;
  startIndex: number;
  endIndex: number;
}> {
  const matches: Array<{
    stitch: DetectedStitch;
    match: RegExpMatchArray;
    startIndex: number;
    endIndex: number;
  }> = [];

  STITCH_DICTIONARY.forEach((stitch) => {
    const regex = new RegExp(stitch.pattern.source, stitch.pattern.flags);
    let match;
    
    // Reset regex lastIndex to avoid issues
    regex.lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        stitch,
        match,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  });

  // Sort by position in text
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Gets the color for a stitch type
 */
export function getStitchColor(type: StitchType): string {
  const stitch = STITCH_DICTIONARY.find((s) => s.type === type);
  return stitch?.color || '#95A5A6';
}

/**
 * Gets stitch information by abbreviation
 */
export function getStitchInfo(abbreviation: string): DetectedStitch | undefined {
  return STITCH_DICTIONARY.find(
    (s) => s.abbreviation.toLowerCase() === abbreviation.toLowerCase()
  );
}


