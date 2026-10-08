export function creditUsageTone(percentage: number): "positive" | "warning" | "danger" {
  if (percentage < 30) return "positive";
  if (percentage < 50) return "warning";
  return "danger";
}