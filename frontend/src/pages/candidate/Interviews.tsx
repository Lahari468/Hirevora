import { Video, Phone, Users, Code, Building2, ExternalLink } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { formatDateTime } from "../../lib/format.js";
import { useInterviews, type InterviewWithContext } from "../../hooks/useInterviews.js";
import type { InterviewType } from "../../types/index.js";

const TYPE_ICON: Record<InterviewType, typeof Video> = {
  PHONE: Phone,
  VIDEO: Video,
  TECHNICAL: Code,
  HR: Users,
  ONSITE: Building2,
};

const TYPE_LABEL: Record<InterviewType, string> = {
  PHONE: "Phone interview",
  VIDEO: "Video interview",
  TECHNICAL: "Technical interview",
  HR: "HR interview",
  ONSITE: "On-site interview",
};

function InterviewRow({ interview }: { interview: InterviewWithContext }): JSX.Element {
  const Icon = TYPE_ICON[interview.interviewType];
  return (
    <div className="flex items-start gap-3 border-b border-surface-border px-5 py-4 last:border-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-navy-800">{TYPE_LABEL[interview.interviewType]}</p>
        <p className="text-xs text-navy-500">
          {interview.job ? `${interview.job.title} · ${interview.job.company.name}` : "Job details unavailable"}
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
      <StatusBadge status={interview.status} />
    </div>
  );
}

export function Interviews(): JSX.Element {
  const { interviews, isLoading, error, refetch } = useInterviews();

  const upcoming = interviews.filter((i) => i.status === "SCHEDULED");
  const past = interviews.filter((i) => i.status !== "SCHEDULED");

  return (
    <AppShell title="Interviews">
      <PageHeader title="Interviews" description="Your scheduled and past interviews." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && isLoading && (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!error && !isLoading && (
        <div className="space-y-6">
          <ContentCard title="Upcoming" noPadding>
            {upcoming.length === 0 ? (
              <EmptyState title="No upcoming interviews" />
            ) : (
              upcoming.map((interview) => <InterviewRow key={interview.id} interview={interview} />)
            )}
          </ContentCard>

          <ContentCard title="Past" noPadding>
            {past.length === 0 ? (
              <EmptyState title="No past interviews yet" />
            ) : (
              past.map((interview) => <InterviewRow key={interview.id} interview={interview} />)
            )}
          </ContentCard>
        </div>
      )}
    </AppShell>
  );
}
