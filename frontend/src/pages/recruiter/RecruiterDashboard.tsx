import { Link } from "react-router-dom";
import { Briefcase, Users, FileText, CalendarClock, ArrowRight } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { Pipeline } from "../../components/dashboard/Pipeline.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { formatDate } from "../../lib/format.js";
import { useAuth } from "../../context/AuthContext.js";
import { useRecruiterDashboard } from "../../hooks/useRecruiterDashboard.js";
import type { ApplicationStatus } from "../../types/index.js";

/** Real pipeline stages, in the order applications actually flow through them (backend/src/services/applicationService.ts validTransitions). */
const PIPELINE_STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENING", label: "Screening" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
];

export function RecruiterDashboard(): JSX.Element {
  const { user } = useAuth();
  const { data: stats, isLoading, error, refetch } = useRecruiterDashboard();

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Good to see you${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening with your hiring."
        actions={
          <>
            <Link to="/recruiter/applications">
              <Button variant="outline">View applications</Button>
            </Link>
            <Link to="/recruiter/jobs/new">
              <Button>
                Create job
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
      />

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading || !stats ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Open Jobs" value={stats.jobs.open} icon={<Briefcase className="h-4 w-4" />} />
            <StatCard
              label="Total Applications"
              value={stats.applications.total}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard
              label="Interviews (pipeline)"
              value={stats.applications.byStatus.INTERVIEW ?? 0}
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatCard label="Total Jobs" value={stats.jobs.total} icon={<Users className="h-4 w-4" />} />
          </div>

          <div className="mt-6">
            <ContentCard title="Hiring Pipeline" subtitle="Applications across all your jobs, by stage">
              <Pipeline
                stages={PIPELINE_STAGES.map((stage) => ({
                  key: stage.key,
                  label: stage.label,
                  count: stats.applications.byStatus[stage.key] ?? 0,
                }))}
              />
            </ContentCard>
          </div>

          <div className="mt-6">
            <ContentCard
              title="Recent Applications"
              action={
                <Link to="/recruiter/applications" className="text-sm font-medium text-accent-600 hover:text-accent-700">
                  View all
                </Link>
              }
              noPadding
            >
              {stats.recentApplications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Applications to your jobs will show up here."
                />
              ) : (
                <ul className="divide-y divide-surface-border">
                  {stats.recentApplications.map((app) => (
                    <li key={app.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-800">{app.candidate.name}</p>
                        <p className="truncate text-xs text-navy-500">
                          {app.job?.title ?? "Job removed"} · Applied {formatDate(app.appliedAt)}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </li>
                  ))}
                </ul>
              )}
            </ContentCard>
          </div>
        </>
      )}
    </AppShell>
  );
}
