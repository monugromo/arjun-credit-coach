import { expect, test } from "bun:test";
import { gaugeScoreAt, GAUGE_DURATION_MS, GAUGE_SWEEP_MS } from "./report-animation";

test("needle and score sweep to 900 before returning to the actual score", () => {
  expect(gaugeScoreAt(0, 413)).toBe(300);
  expect(gaugeScoreAt(GAUGE_SWEEP_MS, 413)).toBe(900);
  expect(gaugeScoreAt(GAUGE_DURATION_MS, 413)).toBe(413);
});

test("return is gradual rather than jumping to the final score", () => {
  expect(gaugeScoreAt(GAUGE_SWEEP_MS + 100, 413)).toBeGreaterThan(890);
  expect(gaugeScoreAt(GAUGE_SWEEP_MS + 1200, 413)).toBe(656.5);
  expect(gaugeScoreAt(GAUGE_DURATION_MS + 100, 706)).toBe(706);
});