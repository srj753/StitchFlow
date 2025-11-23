/**
 * Yarn Stash Management Types
 * 
 * Tracks yarns owned by the user and their allocation to projects.
 */

export type YarnWeightCategory =
  | 'Lace'
  | 'Fingering'
  | 'Sport'
  | 'DK'
  | 'Worsted'
  | 'Aran'
  | 'Bulky'
  | 'Super Bulky'
  | 'Jumbo';

export type Yarn = {
  id: string;
  name: string;
  brand?: string;
  color: string;
  colorHex?: string; // Optional hex code for visual display
  weightCategory: YarnWeightCategory;
  metersPerSkein: number;
  yardagePerSkein: number;
  skeinsOwned: number;
  skeinsReserved: number; // Allocated to projects
  pricePerSkein?: number;
  purchasedFrom?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type YarnInput = {
  name: string;
  brand?: string;
  color: string;
  colorHex?: string;
  weightCategory: YarnWeightCategory;
  metersPerSkein: number;
  yardagePerSkein: number;
  skeinsOwned: number;
  pricePerSkein?: number;
  purchasedFrom?: string;
  notes?: string;
};

/**
 * Links a yarn to a project with quantity used
 */
export type ProjectYarn = {
  id: string;
  projectId: string;
  yarnId: string;
  skeinsUsed: number;
  metersUsed?: number;
  addedAt: string;
};




