import { Badge } from "./Badge.js";

/**
 * Maps common backend status strings (application/job/offer/interview
 * status enums) to a consistent badge color so every table/list in the app
 * renders status the same way.
 */
const STATUS_MAP: Record<string, { label: string; variant: "neutral" | "success" | "warning" | "danger" | "info" | "accent" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  OPEN: { label: "Open", variant: "success" },
  APPROVED: { label: "Approved", variant: "success" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  HIRED: { label: "Hired", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  IN_REVIEW: { label: "In review", variant: "warning" },
  SCHEDULED: { label: "Scheduled", variant: "warning" },
  // Real ApplicationStatus enum values (backend/prisma/schema.prisma)
  APPLIED: { label: "Applied", variant: "neutral" },
  SCREENING: { label: "Screening", variant: "warning" },
  SHORTLISTED: { label: "Shortlisted", variant: "info" },
  INTERVIEW: { label: "Interview", variant: "info" },
  OFFER: { label: "Offer", variant: "accent" },
  DRAFT: { label: "Draft", variant: "neutral" },
  CLOSED: { label: "Closed", variant: "neutral" },
  INACTIVE: { label: "Inactive", variant: "neutral" },
  WITHDRAWN: { label: "Withdrawn", variant: "neutral" },
  REJECTED: { label: "Rejected", variant: "danger" },
  DECLINED: { label: "Declined", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  FLAGGED: { label: "Flagged", variant: "danger" },
};

export function StatusBadge({ status }: { status: string }): JSX.Element {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  const entry = STATUS_MAP[normalized] ?? {
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    variant: "neutral" as const,
  };

  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
