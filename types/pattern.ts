import type { Project } from './project';

export type PatternDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type RowAnnotation = {
  rowId: string;
  note?: string;
  highlightColor?: string;
  isCrossedOut?: boolean;
  createdAt: string;
  modifiedAt?: string;
};

export type PatternModification = {
  id: string;
  type: 'text_change' | 'note_added' | 'note_modified' | 'annotation_added' | 'annotation_removed';
  description: string;
  timestamp: string;
  rowId?: string;
  oldValue?: string;
  newValue?: string;
};

export type PatternVersion = {
  id: string;
  version: number;
  timestamp: string;
  changes: PatternModification[];
  snippet?: string;
  annotations?: Record<string, RowAnnotation>;
};

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
  // Phase 2.3: Annotations and version history
  rowAnnotations?: Record<string, RowAnnotation>; // Map of rowId -> annotation
  modifications?: PatternModification[]; // History of changes
  versions?: PatternVersion[]; // Version snapshots
  currentVersion?: number; // Current version number
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

