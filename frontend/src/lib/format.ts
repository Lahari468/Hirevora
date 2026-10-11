import type { EmploymentType } from "../types/index.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Resolves a relative URL against the backend's origin (e.g. a company
 * logoUrl or a job posting's external link), not the frontend dev server.
 * Resume files no longer go through this — they're private and require
 * authentication, so they're fetched via openAuthenticatedFile()
 * (lib/fileAccess.ts) instead of a plain resolved href.
 */
export function resolveFileUrl(fileUrl: string): string {
  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  return `${API_URL}${fileUrl}`;
}

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

export function formatEmploymentType(type: EmploymentType): string {
  return EMPLOYMENT_TYPE_LABELS[type] ?? type;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function formatSalaryRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number): string =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  if (min !== null && max !== null) return `$${fmt(min)} – $${fmt(max)}`;
  if (min !== null) return `From $${fmt(min)}`;
  return `Up to $${fmt(max as number)}`;
}

export function formatExperienceRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    if (min === max) return `${min} yr${min === 1 ? "" : "s"}`;
    return `${min}–${max} yrs`;
  }
  if (min !== null) return `${min}+ yrs`;
  return `Up to ${max} yrs`;
}
