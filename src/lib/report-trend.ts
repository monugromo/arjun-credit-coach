export interface ScoreRecord {
  date: string;
  score: number;
}

export const SCORE_TREND_TICKS = [900, 750, 600, 450, 300] as const;

export function scoreTrendY(score: number): number {
  return 120 - (Math.max(300, Math.min(900, score)) - 300) / 600 * 96;
}

export function recentScoreRecords(records: readonly ScoreRecord[]): ScoreRecord[] {
  return records
    .filter(record => Number.isFinite(Date.parse(record.date)) && Number.isFinite(record.score) && record.score >= 300 && record.score <= 900)
    .slice()
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(-7);
}

export function scoreRecordDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(date));
}