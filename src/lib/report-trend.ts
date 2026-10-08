export interface ScoreRecord {
  date: string;
  score: number;
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