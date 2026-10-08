import { expect, test } from "bun:test";
import { recentScoreRecords, scoreRecordDate, SCORE_TREND_TICKS, scoreTrendY } from "./report-trend";

test("shows only the latest seven recorded pulls, in date order", () => {
  const records = Array.from({ length: 9 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}`, score: 400 + index }));
  expect(recentScoreRecords(records.reverse())).toEqual(records.slice().reverse().slice(2));
  expect(recentScoreRecords(records)).toHaveLength(7);
});

test("does not invent scores when fewer than seven pulls exist", () => {
  expect(recentScoreRecords([{ date: "2026-10-05", score: 413 }])).toEqual([{ date: "2026-10-05", score: 413 }]);
  expect(recentScoreRecords([])).toEqual([]);
});

test("labels recorded dates with day and month", () => {
  expect(scoreRecordDate("2026-10-05")).toBe("05 Oct");
  expect(scoreRecordDate("2026-09-19")).toBe("19 Sep");
});

test("uses the full 300–900 range for every recorded score", () => {
  expect(SCORE_TREND_TICKS).toEqual([900, 750, 600, 450, 300]);
  expect(scoreTrendY(300)).toBe(120);
  expect(scoreTrendY(600)).toBe(72);
  expect(scoreTrendY(900)).toBe(24);
});