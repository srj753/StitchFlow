/**
 * Voice Command Parser
 * Parses natural language voice commands into actionable counter operations
 */

export type VoiceCommandAction = 
  | { type: 'increment'; counterName?: string; amount?: number }
  | { type: 'decrement'; counterName?: string; amount?: number }
  | { type: 'set'; counterName?: string; value: number }
  | { type: 'reset'; counterName?: string }
  | { type: 'read'; counterName?: string }
  | { type: 'unknown'; text: string };

export interface ParsedCommand {
  action: VoiceCommandAction;
  confidence: number;
  originalText: string;
}

/**
 * Parse voice command text into structured actions
 */
export function parseVoiceCommand(text: string): ParsedCommand {
  const normalized = text.toLowerCase().trim();
  
  // Increment commands
  const incrementPatterns = [
    /(?:add|increment|increase|plus|up)\s*(?:by\s*)?(\d+)?\s*(?:to\s*)?(?:the\s*)?(?:row|round|stitch|counter)?\s*(?:counter)?\s*(?:named\s*)?(.+)?/i,
    /(\d+)\s*(?:more|additional)?\s*(?:rows?|rounds?|stitches?)?/i,
    /(?:row|round|stitch)\s*(?:counter)?\s*(?:up|add|increment)/i,
  ];
  
  for (const pattern of incrementPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const amount = match[1] ? parseInt(match[1], 10) : 1;
      const counterName = match[2]?.trim();
      return {
        action: { type: 'increment', counterName, amount },
        confidence: 0.9,
        originalText: text,
      };
    }
  }
  
  // Decrement commands
  const decrementPatterns = [
    /(?:subtract|decrement|decrease|minus|down|remove)\s*(?:by\s*)?(\d+)?\s*(?:from\s*)?(?:the\s*)?(?:row|round|stitch|counter)?\s*(?:counter)?\s*(?:named\s*)?(.+)?/i,
    /(\d+)\s*(?:less|fewer)?/i,
  ];
  
  for (const pattern of decrementPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const amount = match[1] ? parseInt(match[1], 10) : 1;
      const counterName = match[2]?.trim();
      return {
        action: { type: 'decrement', counterName, amount },
        confidence: 0.9,
        originalText: text,
      };
    }
  }
  
  // Set value commands
  const setPatterns = [
    /(?:set|make|put)\s*(?:the\s*)?(?:row|round|stitch|counter)?\s*(?:counter)?\s*(?:named\s*)?(.+)?\s*(?:to|at|equal)\s*(\d+)/i,
    /(?:row|round|stitch)\s*(?:counter)?\s*(?:is|equals?)\s*(\d+)/i,
  ];
  
  for (const pattern of setPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const value = parseInt(match[match.length - 1], 10);
      const counterName = match[1]?.trim();
      return {
        action: { type: 'set', counterName, value },
        confidence: 0.85,
        originalText: text,
      };
    }
  }
  
  // Reset commands
  if (/reset|clear|zero|start\s*over/i.test(normalized)) {
    const counterMatch = normalized.match(/(?:the\s*)?(?:row|round|stitch|counter)?\s*(?:counter)?\s*(?:named\s*)?(.+)?/i);
    const counterName = counterMatch?.[1]?.trim();
    return {
      action: { type: 'reset', counterName },
      confidence: 0.9,
      originalText: text,
    };
  }
  
  // Read/query commands
  const readPatterns = [
    /(?:what|tell\s*me|read|say)\s*(?:is|'?s)?\s*(?:the\s*)?(?:current\s*)?(?:row|round|stitch|counter)?\s*(?:counter)?\s*(?:value|number|at)?\s*(?:named\s*)?(.+)?/i,
    /(?:how\s*many|what\s*row)\s*(?:am\s*i\s*on|are\s*we\s*on)/i,
  ];
  
  for (const pattern of readPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const counterName = match[1]?.trim();
      return {
        action: { type: 'read', counterName },
        confidence: 0.85,
        originalText: text,
      };
    }
  }
  
  // Unknown command
  return {
    action: { type: 'unknown', text },
    confidence: 0,
    originalText: text,
  };
}

/**
 * Find matching counter by name (fuzzy matching)
 */
export function findCounterByName(
  counters: Array<{ id: string; label: string }>,
  searchName?: string,
): { id: string; label: string } | null {
  if (!searchName) return null;
  
  const normalized = searchName.toLowerCase();
  
  // Exact match
  const exact = counters.find(
    (c) => c.label.toLowerCase() === normalized,
  );
  if (exact) return exact;
  
  // Partial match
  const partial = counters.find((c) =>
    c.label.toLowerCase().includes(normalized) ||
    normalized.includes(c.label.toLowerCase()),
  );
  if (partial) return partial;
  
  // Keyword matching
  const keywords: Record<string, string[]> = {
    row: ['row', 'rows'],
    round: ['round', 'rounds', 'rnd'],
    stitch: ['stitch', 'stitches', 'st'],
  };
  
  for (const [key, variants] of Object.entries(keywords)) {
    if (variants.some((v) => normalized.includes(v))) {
      const match = counters.find((c) =>
        c.label.toLowerCase().includes(key),
      );
      if (match) return match;
    }
  }
  
  return null;
}







