/**
 * Gauge & yarn estimator stubs.
 * TODO: Replace with real math based on swatch input and fiber data.
 */

export type GaugeInput = {
  stitchesPer4Inches: number;
  rowsPer4Inches: number;
  widthInches: number;
  heightInches: number;
};

export function estimateSkeinsFromGauge({
  stitchesPer4Inches,
  rowsPer4Inches,
  widthInches,
  heightInches,
}: GaugeInput): number {
  if (!stitchesPer4Inches || !rowsPer4Inches) return 0;
  const stitchesPerInch = stitchesPer4Inches / 4;
  const rowsPerInch = rowsPer4Inches / 4;
  const totalStitches = widthInches * heightInches * stitchesPerInch * rowsPerInch;
  // TODO: Convert total stitches to yardage using fiber density table.
  const yardsPerStitch = 0.05; // placeholder
  const totalYards = totalStitches * yardsPerStitch;
  const yardsPerSkein = 200; // placeholder
  return Math.ceil(totalYards / yardsPerSkein);
}



