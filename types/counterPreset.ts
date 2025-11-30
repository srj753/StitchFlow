import type { ProjectCounter } from './project';

export type CounterPreset = {
  id: string;
  name: string;
  description?: string;
  category: 'amigurumi' | 'blanket' | 'garment' | 'accessory' | 'custom';
  counters: Array<{
    type: ProjectCounter['type'];
    label: string;
    targetValue?: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CounterPresetInput = {
  name: string;
  description?: string;
  category: CounterPreset['category'];
  counters: CounterPreset['counters'];
};

