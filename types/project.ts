import type { ProjectYarn } from './yarn';

export type ProjectSection = {
  id: string;
  name: string;
  targetRows?: number;
  completedRows: number;
};

export type RoundLogEntry = {
  id: string;
  projectId: string;
  roundNumber: number;
  delta: number;
  createdAt: string;
};

/**
 * Journal/Timeline entry for project progress tracking
 */
export type JournalEntry = {
  id: string;
  projectId: string;
  type: 'note' | 'progress' | 'finished' | 'photo' | 'milestone';
  title?: string;
  text?: string;
  photoUri?: string;
  metadata?: {
    roundsCompleted?: number;
    heightAchieved?: number;
    [key: string]: any;
  };
  createdAt: string;
};

/**
 * Counter state for stitches/rows
 * Designed to persist across app restarts and screen locks
 */
export type ProjectCounter = {
  id: string;
  projectId: string;
  type: 'row' | 'stitch' | 'custom';
  label: string; // e.g., "Main body", "Left sleeve"
  currentValue: number;
  targetValue?: number;
  lastUpdated: string;
  linkedCounterIds?: string[]; // IDs of counters linked to this one
};

export type Project = {
  id: string;
  name: string;
  patternName?: string;
  patternSourceType: 'external' | 'built-in' | 'my-pattern';
  yarnWeight?: string;
  hookSizeMm?: number;
  targetHeightInches?: number;
  totalRoundsEstimate?: number;
  
  // Legacy counters (will migrate to counters array)
  currentRound: number;
  currentHeightInches: number;
  
  // New counter system
  counters: ProjectCounter[];
  
  // Notes & pattern
  notes?: string;
  progressNotes?: string;
  patternSnippet?: string;
  
  // Status & organization
  status: 'active' | 'paused' | 'finished';
  sections: ProjectSection[];
  roundLog: RoundLogEntry[]; // Legacy, kept for backwards compat
  
  // New features
  journal: JournalEntry[];
  photos: string[]; // Array of photo URIs
  thumbnail?: string; // Explicit thumbnail field
  timeSpentMinutes: number; // Track time spent on project
  yarnIds: string[]; // Deprecated - kept for backwards compat
  linkedYarns: ProjectYarn[]; // Details about linked yarn quantities
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  sourceUrl?: string;
  colorPalette?: string[];
  
  // Future features (stubs)
  gaugeSwatchRows?: number;
  gaugeSwatchStitches?: number;
  gaugeSwatchInches?: number;
};

export type ProjectInput = {
  name: string;
  patternName?: string;
  patternSourceType?: Project['patternSourceType'];
  yarnWeight?: string;
  hookSizeMm?: number;
  targetHeightInches?: number;
  totalRoundsEstimate?: number;
  notes?: string;
  progressNotes?: string;
  patternSnippet?: string;
  status?: Project['status'];
  sourceUrl?: string;
  colorPalette?: string[];
  yarnIds?: string[];
  linkedYarns?: ProjectYarn[];
  gaugeSwatchRows?: number;
  gaugeSwatchStitches?: number;
  gaugeSwatchInches?: number;
  thumbnail?: string;
  timeSpentMinutes?: number;
};
