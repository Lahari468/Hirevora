import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Circle, FileText } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Button } from "../../components/ui/Button.js";
import { formatDate, formatDateTime, resolveFileUrl } from "../../lib/format.js";
import { useApplicationDetails } from "../../hooks/useApplicationDetails.js";
import { cn } from "../../lib/cn.js";
import type { ApplicationStatus } from "../../types/index.js";

const STATUS_ORDER: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

export function ApplicationDetails(): JSX.Element {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: application, isLoading, error, refetch } = useApplicationDetails(applicationId);

  if (isLoading) {
    return (
      <AppShell title="Application">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !application) {
    return (
      <AppShell title="Application">
        <ErrorState description={error ?? "This application could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  const isRejected = application.status === "REJECTED";
  const currentIndex = STATUS_ORDER.indexOf(application.status);
  const history = application.statusHistory ?? [];

  return (
    <AppShell title="Application">
      <PageHeader
        title={application.job?.title ?? "Application"}
        breadcrumb={application.job?.company.name}
        actions={<StatusBadge status={application.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Application timeline" />
            <CardContent>
              {isRejected ? (
                <div className="flex items-center gap-3 rounded-md bg-danger-50 px-4 py-3">
                  <StatusBadge status="REJECTED" />
                  <p className="text-sm text-navy-600">
                    This application was not moved forward.
                  </p>
                </div>
              ) : (
                <ol className="space-y-0">
                  {STATUS_ORDER.map((status, idx) => {
                    const isComplete = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    const historyEntry = history.find((h) => h.newStatus === status);
                    return (
                      <li key={status} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          {isComplete ? (
                            <CheckCircle2
                              className={cn(
                                "h-5 w-5",
                                isCurrent ? "text-accent-600" : "text-success-600"
                              )}
                            />
                          ) : (
                            <Circle className="h-5 w-5 text-navy-200" />
                          )}
                          {idx < STATUS_ORDER.length - 1 && (
                            <span
                              className={cn(
                                "my-0.5 h-8 w-px",
                                isComplete ? "bg-success-300" : "bg-surface-border"
                              )}
                            />
                          )}
                        </div>
                        <div className="pb-6">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isComplete ? "text-navy-800" : "text-navy-400"
                            )}
                          >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </p>
                          {historyEntry && (
                            <p className="text-xs text-navy-400">
                              {formatDateTime(historyEntry.changedAt)}
                            </p>
                          )}
                          {historyEntry?.comment && (
                            <p className="mt-1 text-xs text-navy-500">{historyEntry.comment}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          {application.coverLetter && (
            <Card>
              <CardHeader title="Cover letter" />
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">
                  {application.coverLetter}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Application info" />
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Applied</span>
                <span className="text-navy-800">{formatDate(application.appliedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Last updated</span>
                <span className="text-navy-800">{formatDate(application.updatedAt)}</span>
              </div>
              {application.job && (
                <div className="flex justify-between">
                  <span className="text-navy-500">Location</span>
                  <span className="text-navy-800">{application.job.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {application.resume && (
            <Card>
              <CardHeader title="Submitted resume" />
              <CardContent>
                <a
                  href={resolveFileUrl(application.resume.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring flex items-center gap-2 rounded-md border border-surface-border p-3 text-sm text-navy-700 hover:bg-surface-muted"
                >
                  <FileText className="h-4 w-4 text-navy-400" />
                  {application.resume.fileName}
                </a>
              </CardContent>
            </Card>
          )}

          {application.job && (
            <Link to={`/candidate/jobs/${application.job.id}`}>
              <Button variant="outline" className="w-full">
                View job posting
              </Button>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
