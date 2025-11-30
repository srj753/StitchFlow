import type { Project } from './project';

export type PatternDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type Pattern = {
  id: string;
  name: string;
  designer: string;
  description: string;
  difficulty: PatternDifficulty;
  duration: string;
  yarnWeight: string;
  hookSize: string;
  stitches: string[];
  moods: string[];
  tags: string[];
  palette: string[];
  hero?: boolean;
  referenceUrl?: string;
  fileUri?: string;
  snippet?: string;
  estimatedRounds?: number;
  targetHeightInches?: number;
  notes?: string;
  patternSourceType?: Project['patternSourceType'];
  sourceType?: 'catalog' | 'imported' | 'draft';
  importedAt?: string;
  rowChecklist?: string[]; // Array of completed row IDs
};

export type PatternInput = {
  name: string;
  designer?: string;
  description: string;
  difficulty: PatternDifficulty;
  duration?: string;
  yarnWeight?: string;
  hookSize?: string;
  stitches?: string[];
  moods?: string[];
  tags?: string[];
  palette?: string[];
  referenceUrl?: string;
  fileUri?: string;
  snippet?: string;
  notes?: string;
  patternSourceType?: Project['patternSourceType'];
};

