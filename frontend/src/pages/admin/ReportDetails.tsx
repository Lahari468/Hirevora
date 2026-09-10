import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Button } from "../../components/ui/Button.js";
import { Modal } from "../../components/ui/Modal.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { useAdminReport } from "../../hooks/useAdminReport.js";
import { adminReportService } from "../../services/adminReportService.js";
import { useToast } from "../../context/ToastContext.js";
import { formatDateTime } from "../../lib/format.js";
import { REPORT_STATUS_TRANSITIONS } from "../../types/index.js";
import type { ApiResponse, ReportStatus } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

const STATUS_VARIANT: Record<ReportStatus, "warning" | "info" | "success" | "neutral"> = {
  PENDING: "warning",
  REVIEWING: "info",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

/** Only JOB and USER targets have a real admin detail page to link to. */
function targetLink(targetType: string, targetId: string): string | null {
  if (targetType === "JOB") return `/admin/jobs/${targetId}`;
  if (targetType === "USER") return `/admin/users/${targetId}`;
  return null;
}

export function ReportDetails(): JSX.Element {
  const { reportId } = useParams<{ reportId: string }>();
  const { showToast } = useToast();
  const { data: report, isLoading, error, refetch } = useAdminReport(reportId);

  const [nextStatus, setNextStatus] = useState<ReportStatus | "">("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedTransitions = report ? REPORT_STATUS_TRANSITIONS[report.status] : [];
  const requiresNote = nextStatus === "RESOLVED" || nextStatus === "DISMISSED";

  const applyStatusChange = async (): Promise<void> => {
    if (!reportId || !nextStatus) return;
    setIsSubmitting(true);
    try {
      const res = await adminReportService.updateStatus(reportId, {
        status: nextStatus as Exclude<ReportStatus, "PENDING">,
        resolutionNote: resolutionNote || undefined,
      });
      if (res.success) {
        showToast(`Report marked ${nextStatus.toLowerCase()}`, "success");
        setNextStatus("");
        setResolutionNote("");
        setIsConfirmOpen(false);
        refetch();
      } else {
        showToast(res.message, "error");
      }
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to update report.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (): void => {
    if (!nextStatus) return;
    if (requiresNote && !resolutionNote.trim()) {
      showToast("A resolution note is required to resolve or dismiss a report.", "error");
      return;
    }
    if (nextStatus === "RESOLVED" || nextStatus === "DISMISSED") {
      setIsConfirmOpen(true);
      return;
    }
    void applyStatusChange();
  };

  if (isLoading) {
    return (
      <AppShell title="Report">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !report) {
    return (
      <AppShell title="Report">
        <ErrorState description={error ?? "This report could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  const reporterLink = `/admin/users/${report.reporterId}`;
  const linkToTarget = targetLink(report.targetType, report.targetId);

  return (
    <AppShell title="Report">
      <PageHeader
        title={`Report ${report.id.slice(0, 8)}`}
        breadcrumb={report.targetType}
        actions={<Badge variant={STATUS_VARIANT[report.status]}>{report.status}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Report details" />
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Reason</span>
                <span className="text-navy-800">{report.reason.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Reporter</span>
                <Link to={reporterLink} className="font-mono text-xs text-accent-600 hover:text-accent-700">
                  {report.reporterId}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Target</span>
                {linkToTarget ? (
                  <Link to={linkToTarget} className="font-mono text-xs text-accent-600 hover:text-accent-700">
                    {report.targetType} · {report.targetId}
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-navy-500">
                    {report.targetType} · {report.targetId}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Submitted</span>
                <span className="text-navy-800">{formatDateTime(report.createdAt)}</span>
              </div>
              {report.description && (
                <div className="pt-2">
                  <p className="text-navy-500">Description</p>
                  <p className="mt-1 whitespace-pre-line text-navy-700">{report.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {report.resolutionNote && (
            <Card>
              <CardHeader title="Resolution" />
              <CardContent className="space-y-2 text-sm">
                <p className="whitespace-pre-line text-navy-700">{report.resolutionNote}</p>
                {report.resolvedAt && (
                  <p className="text-xs text-navy-400">Resolved {formatDateTime(report.resolvedAt)}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Moderation action" />
          <CardContent className="flex flex-col gap-3">
            {allowedTransitions.length === 0 ? (
              <p className="text-sm text-navy-500">
                This report is {report.status.toLowerCase()} — no further action is available.
              </p>
            ) : (
              <>
                <Select
                  label="Change status to"
                  placeholder="Select a status"
                  options={allowedTransitions.map((s) => ({ value: s, label: s }))}
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ReportStatus)}
                />
                <Textarea
                  label="Resolution note"
                  hint={requiresNote ? "Required to resolve or dismiss" : "Optional"}
                  rows={4}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
                <Button onClick={handleSubmit} isLoading={isSubmitting && !isConfirmOpen} disabled={!nextStatus}>
                  Apply
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`Mark report as ${nextStatus}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isSubmitting} onClick={() => void applyStatusChange()}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          This will {nextStatus === "RESOLVED" ? "resolve" : "dismiss"} the report and cannot be undone.
        </p>
      </Modal>
    </AppShell>
  );
}
