import { useState } from "react";
import { Video, Phone, Users, Code, Building2, ExternalLink, X, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { Button } from "../../components/ui/Button.js";
import { Modal } from "../../components/ui/Modal.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { formatDateTime } from "../../lib/format.js";
import { useRecruiterInterviews, type RecruiterInterviewRow } from "../../hooks/useRecruiterInterviews.js";
import { interviewService } from "../../services/interviewService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse, InterviewType } from "../../types/index.js";

const TYPE_ICON: Record<InterviewType, typeof Video> = {
  PHONE: Phone,
  VIDEO: Video,
  TECHNICAL: Code,
  HR: Users,
  ONSITE: Building2,
};

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function Interviews(): JSX.Element {
  const { interviews, isLoading, error, refetch } = useRecruiterInterviews();
  const { showToast } = useToast();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upcoming = interviews.filter((i) => i.status === "SCHEDULED");
  const past = interviews.filter((i) => i.status !== "SCHEDULED");

  const handleCancel = async (id: string): Promise<void> => {
    try {
      await interviewService.cancel(id);
      showToast("Interview cancelled", "info");
      refetch();
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to cancel interview.", "error");
    }
  };

  const handleComplete = async (): Promise<void> => {
    if (!completingId || feedback.trim().length < 10) return;
    setIsSubmitting(true);
    try {
      await interviewService.complete(completingId, { feedback: feedback.trim() });
      showToast("Interview marked complete", "success");
      setCompletingId(null);
      setFeedback("");
      refetch();
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to complete interview.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  function Row({ interview }: { interview: RecruiterInterviewRow }): JSX.Element {
    const Icon = TYPE_ICON[interview.interviewType];
    return (
      <div className="flex items-start gap-3 border-b border-surface-border px-5 py-4 last:border-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy-800">
            {interview.context?.candidate.name ?? "Candidate"}
          </p>
          <p className="text-xs text-navy-500">
            {interview.context?.job.title ?? "Job details unavailable"}
          </p>
          <p className="mt-1 text-xs text-navy-400">{formatDateTime(interview.scheduledAt)}</p>
          {interview.meetingLink && interview.status === "SCHEDULED" && (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="focus-ring mt-1 inline-flex items-center gap-1 rounded text-xs font-medium text-accent-600 hover:text-accent-700"
            >
              Join meeting
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {interview.feedback && interview.status === "COMPLETED" && (
            <p className="mt-1 text-xs text-navy-500">{interview.feedback}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={interview.status} />
          {interview.status === "SCHEDULED" && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCompletingId(interview.id)}
                aria-label="Mark complete"
                className="focus-ring rounded p-1 text-navy-400 hover:bg-success-50 hover:text-success-600"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void handleCancel(interview.id)}
                aria-label="Cancel interview"
                className="focus-ring rounded p-1 text-navy-400 hover:bg-danger-50 hover:text-danger-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AppShell title="Interviews">
      <PageHeader title="Interviews" description="Interviews scheduled across your jobs." />

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <ContentCard title="Upcoming" noPadding>
            {upcoming.length === 0 ? (
              <EmptyState title="No upcoming interviews" />
            ) : (
              upcoming.map((interview) => <Row key={interview.id} interview={interview} />)
            )}
          </ContentCard>

          <ContentCard title="Past" noPadding>
            {past.length === 0 ? (
              <EmptyState title="No past interviews yet" />
            ) : (
              past.map((interview) => <Row key={interview.id} interview={interview} />)
            )}
          </ContentCard>
        </div>
      )}

      <Modal
        isOpen={completingId !== null}
        onClose={() => setCompletingId(null)}
        title="Complete interview"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCompletingId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleComplete()}
              isLoading={isSubmitting}
              disabled={feedback.trim().length < 10}
            >
              Mark complete
            </Button>
          </>
        }
      >
        <Textarea
          label="Feedback"
          hint="At least 10 characters"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Modal>
    </AppShell>
  );
}
