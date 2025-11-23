/**
 * Very rough yarn estimator utilities.
 * TODO: Replace with gauge-aware calculations once we capture swatch data.
 */

export type YarnEstimatorInput = {
  widthInches: number;
  heightInches: number;
  yarnWeightFactor?: number; // heuristic multiplier per weight category
  yardagePerSkein: number;
  bufferPercentage?: number;
};

export type YarnEstimatorResult = {
  estimatedYards: number;
  estimatedSkeins: number;
};

/**
 * Computes a naive yardage estimate based on surface area.
 * This is intentionally simple and will be replaced with gauge-driven math.
 */
export function estimateYarnRequirement({
  widthInches,
  heightInches,
  yarnWeightFactor = 1,
  yardagePerSkein,
  bufferPercentage = 15,
}: YarnEstimatorInput): YarnEstimatorResult {
  if (!widthInches || !heightInches || !yardagePerSkein) {
    return { estimatedYards: 0, estimatedSkeins: 0 };
  }

  const blanketArea = widthInches * heightInches; // square inches
  const baseYards = blanketArea * 0.25 * yarnWeightFactor; // heuristic: 0.25 yards per sq in
  const bufferedYards = baseYards * (1 + bufferPercentage / 100);
  const estimatedSkeins = bufferedYards / yardagePerSkein;

  return {
    estimatedYards: Number(bufferedYards.toFixed(1)),
    estimatedSkeins: Math.ceil(estimatedSkeins * 10) / 10,
  };
}


