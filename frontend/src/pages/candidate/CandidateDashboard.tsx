import { Link } from "react-router-dom";
import { FileText, Bookmark, CalendarClock, Send, ArrowRight } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { formatDate, formatDateTime } from "../../lib/format.js";
import { useAuth } from "../../context/AuthContext.js";
import { useApplications } from "../../hooks/useApplications.js";
import { useSavedJobs } from "../../hooks/useSavedJobs.js";
import { useInterviews } from "../../hooks/useInterviews.js";
import { useCandidateProfile } from "../../hooks/useCandidateProfile.js";

/** Fields counted toward the profile-completion estimate shown on the dashboard. */
const PROFILE_FIELDS = ["headline", "bio", "phone", "location", "experienceYears", "education"] as const;

export function CandidateDashboard(): JSX.Element {
  const { user } = useAuth();
  const { applications, isLoading: appsLoading } = useApplications({ page: 1, limit: 5, sort: "newest" });
  const { pagination: savedPagination, isLoading: savedLoading } = useSavedJobs();
  const { interviews, isLoading: interviewsLoading } = useInterviews();
  const { data: profile, isLoading: profileLoading } = useCandidateProfile();

  const upcomingInterviews = interviews
    .filter((i) => i.status === "SCHEDULED")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  const completedFields = profile
    ? PROFILE_FIELDS.filter((field) => Boolean(profile[field])).length
    : 0;
  const completionPct = Math.round((completedFields / PROFILE_FIELDS.length) * 100);

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Good to see you${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening with your job search."
        actions={
          <Link to="/candidate/jobs">
            <Button>
              Find jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Applications"
          value={appsLoading ? "–" : applications.length}
          icon={<Send className="h-4 w-4" />}
        />
        <StatCard
          label="Saved Jobs"
          value={savedLoading ? "–" : savedPagination?.total ?? 0}
          icon={<Bookmark className="h-4 w-4" />}
        />
        <StatCard
          label="Interviews"
          value={interviewsLoading ? "–" : interviews.length}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          label="Profile Completion"
          value={profileLoading ? "–" : `${completionPct}%`}
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard
          title="Recent Applications"
          className="lg:col-span-2"
          action={
            <Link to="/candidate/applications" className="text-sm font-medium text-accent-600 hover:text-accent-700">
              View all
            </Link>
          }
          noPadding
        >
          {appsLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Jobs you apply to will show up here so you can track their status."
              action={
                <Link to="/candidate/jobs">
                  <Button size="sm">Find jobs</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-surface-border">
              {applications.map((app) => (
                <li key={app.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/candidate/applications/${app.id}`}
                      className="truncate text-sm font-medium text-navy-800 hover:text-accent-700"
                    >
                      {app.job?.title}
                    </Link>
                    <p className="truncate text-xs text-navy-500">
                      {app.job?.company.name} · Applied {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </ContentCard>

        <ContentCard
          title="Upcoming Interviews"
          action={
            <Link to="/candidate/interviews" className="text-sm font-medium text-accent-600 hover:text-accent-700">
              View all
            </Link>
          }
          noPadding
        >
          {interviewsLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <EmptyState title="No interviews scheduled" />
          ) : (
            <ul className="divide-y divide-surface-border">
              {upcomingInterviews.map((interview) => (
                <li key={interview.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-navy-800">
                    {interview.job?.title ?? "Interview"}
                  </p>
                  <p className="text-xs text-navy-500">{interview.job?.company.name}</p>
                  <p className="mt-0.5 text-xs text-navy-400">{formatDateTime(interview.scheduledAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentCard>
      </div>

      {profile && completionPct < 100 && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-accent-100 bg-accent-50 p-4">
          <div>
            <p className="text-sm font-medium text-accent-800">
              Your profile is {completionPct}% complete
            </p>
            <p className="text-xs text-accent-700">
              A complete profile helps recruiters find and shortlist you faster.
            </p>
          </div>
          <Link to="/candidate/profile">
            <Button variant="secondary" size="sm">
              Complete profile
            </Button>
          </Link>
        </div>
      )}
    </AppShell>
  );
}
