/** Hex equivalents of the HireLynk design tokens (tailwind.config.js), for use in recharts fills/strokes. */
export const CHART_COLORS = {
  navy900: "#111729",
  navy400: "#6b7d99",
  navy200: "#c7d0dd",
  accent600: "#4f46e5",
  accent300: "#a5b4fc",
  success500: "#22c55e",
  warning500: "#f59e0b",
  danger500: "#ef4444",
  info500: "#3b82f6",
};

/** Real ApplicationStatus enum values mapped to a chart color that matches StatusBadge's semantics. */
export const APPLICATION_STATUS_CHART_COLOR: Record<string, string> = {
  APPLIED: CHART_COLORS.navy400,
  SCREENING: CHART_COLORS.warning500,
  SHORTLISTED: CHART_COLORS.info500,
  INTERVIEW: CHART_COLORS.info500,
  OFFER: CHART_COLORS.accent600,
  HIRED: CHART_COLORS.success500,
  REJECTED: CHART_COLORS.danger500,
};

export interface DailyBucket {
  /** e.g. "Jan 5" */
  label: string;
  count: number;
}

/**
 * Buckets a list of ISO timestamps into daily counts across the last `days`
 * days (including today), for a real, honest time-series chart built from
 * already-loaded timestamps rather than a backend time-series endpoint
 * (none exists). Days with no events still appear with a 0 count so the
 * chart's x-axis is continuous.
 */
export function bucketByDay(timestamps: string[], days: number): DailyBucket[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const buckets = new Map<string, DailyBucket>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
    });
  }

  const rangeStart = new Date(startOfToday);
  rangeStart.setDate(rangeStart.getDate() - (days - 1));

  for (const ts of timestamps) {
    const date = new Date(ts);
    if (date < rangeStart) continue;
    const key = date.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket.count += 1;
  }

  return Array.from(buckets.values());
}
