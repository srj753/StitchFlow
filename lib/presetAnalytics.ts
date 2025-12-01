import { useCounterPresetsStore } from '@/store/useCounterPresetsStore';
import { CounterPreset } from '@/types/counterPreset';

export type PresetAnalytics = {
  totalPresets: number;
  customPresets: number;
  defaultPresets: number;
  mostUsed: CounterPreset[];
  categoryDistribution: Record<string, number>;
  recentUsage: CounterPreset[];
};

/**
 * Get analytics about preset usage
 */
export function getPresetAnalytics(): PresetAnalytics {
  const store = useCounterPresetsStore.getState();
  const presets = store.presets;
  const usage = store.usage || {};

  const customPresets = presets.filter((p) => !p.id.startsWith('preset_'));
  const defaultPresets = presets.filter((p) => p.id.startsWith('preset_'));

  // Category distribution
  const categoryDistribution: Record<string, number> = {};
  presets.forEach((preset) => {
    categoryDistribution[preset.category] = (categoryDistribution[preset.category] || 0) + 1;
  });

  // Most used presets
  const mostUsed = store.getMostUsedPresets(5);

  // Recent usage (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsage = Object.values(usage)
    .filter((u) => new Date(u.lastUsed) > sevenDaysAgo)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 5)
    .map((u) => presets.find((p) => p.id === u.presetId))
    .filter((p): p is CounterPreset => p !== undefined);

  return {
    totalPresets: presets.length,
    customPresets: customPresets.length,
    defaultPresets: defaultPresets.length,
    mostUsed,
    categoryDistribution,
    recentUsage,
  };
}

/**
 * Get suggested presets based on context
 */
export function getSuggestedPresets(
  projectCategory?: string,
  patternName?: string,
  patternTags?: string[]
): CounterPreset[] {
  const store = useCounterPresetsStore.getState();
  return store.getSuggestedPresets(projectCategory, patternName);
}





