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
  DRAFT: { label: "Draft", variant: "neutral" },
  CLOSED: { label: "Closed", variant: "neutral" },
  INACTIVE: { label: "Inactive", variant: "neutral" },
  WITHDRAWN: { label: "Withdrawn", variant: "neutral" },
  REJECTED: { label: "Rejected", variant: "danger" },
  DECLINED: { label: "Declined", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  FLAGGED: { label: "Flagged", variant: "danger" },
  INTERVIEWING: { label: "Interviewing", variant: "info" },
  OFFERED: { label: "Offered", variant: "info" },
};

export function StatusBadge({ status }: { status: string }): JSX.Element {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  const entry = STATUS_MAP[normalized] ?? {
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    variant: "neutral" as const,
  };

  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
