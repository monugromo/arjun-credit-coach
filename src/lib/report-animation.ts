export const GAUGE_SWEEP_MS = 1200;
export const GAUGE_RETURN_MS = 2400;
export const GAUGE_DURATION_MS = GAUGE_SWEEP_MS + GAUGE_RETURN_MS;

export function gaugeScoreAt(elapsed: number, finalScore: number) {
  const smooth = (value: number) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  if (elapsed <= GAUGE_SWEEP_MS) return 300 + 600 * smooth(elapsed / GAUGE_SWEEP_MS);
  return 900 + (finalScore - 900) * smooth((elapsed - GAUGE_SWEEP_MS) / GAUGE_RETURN_MS);
}