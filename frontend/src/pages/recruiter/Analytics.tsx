import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Briefcase, FileText, CalendarClock, HeartHandshake, Award, Plus } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { useRecruiterAnalytics } from "../../hooks/useRecruiterAnalytics.js";
import { useApplicationIndicators } from "../../hooks/useApplicationIndicators.js";
import { APPLICATION_STATUS_CHART_COLOR, bucketByDay } from "../../lib/chartColors.js";
import type { ApplicationStatus } from "../../types/index.js";

const STAGE_ORDER: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

function formatRate(numerator: number, denominator: number): string {
  if (denominator === 0) return "No data";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function Analytics(): JSX.Element {
  const { stats, interviewTotal, offerTotal, applications, jobs, jobPerformance, isLoading, error, refetch } =
    useRecruiterAnalytics();
  const { interviewByApplicationId, offerByApplicationId } = useApplicationIndicators();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [rangeDays, setRangeDays] = useState(30);

  const filteredApplications = useMemo(
    () => (selectedJobId ? applications.filter((a) => a.job.id === selectedJobId) : applications),
    [applications, selectedJobId]
  );

  const statusBreakdown = useMemo(() => {
    if (!selectedJobId && stats) {
      return STAGE_ORDER.map((status) => ({
        status,
        count: stats.applications.byStatus[status] ?? 0,
      }));
    }
    const counts = new Map<ApplicationStatus, number>(STAGE_ORDER.map((s) => [s, 0]));
    for (const app of filteredApplications) {
      counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
    }
    return STAGE_ORDER.map((status) => ({ status, count: counts.get(status) ?? 0 }));
  }, [selectedJobId, stats, filteredApplications]);

  const timeSeries = useMemo(
    () => bucketByDay(filteredApplications.map((a) => a.appliedAt), rangeDays),
    [filteredApplications, rangeDays]
  );

  const totalApplications = selectedJobId ? filteredApplications.length : stats?.applications.total ?? 0;
  const hires = selectedJobId
    ? filteredApplications.filter((a) => a.status === "HIRED").length
    : stats?.applications.byStatus.HIRED ?? 0;
  const interviewsForView = selectedJobId
    ? filteredApplications.filter((a) => interviewByApplicationId.has(a.id)).length
    : interviewTotal;
  const offersForView = selectedJobId
    ? filteredApplications.filter((a) => offerByApplicationId.has(a.id)).length
    : offerTotal;

  return (
    <AppShell title="Analytics">
      <PageHeader
        title="Recruitment Analytics"
        description="How effective is your hiring pipeline?"
        actions={
          <>
            <div className="w-48">
              <Select
                options={jobs.map((j) => ({ value: j.id, label: j.title }))}
                placeholder="All jobs"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                options={RANGE_OPTIONS}
                value={String(rangeDays)}
                onChange={(e) => setRangeDays(Number(e.target.value))}
              />
            </div>
          </>
        }
      />

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Create your first job to start seeing hiring analytics."
          action={
            <Link to="/recruiter/jobs/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create a job
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {!selectedJobId && (
              <StatCard
                label="Open Jobs"
                value={stats?.jobs.open ?? 0}
                icon={<Briefcase className="h-4 w-4" />}
              />
            )}
            <StatCard
              label="Applications"
              value={totalApplications}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard
              label="Interviews"
              value={interviewsForView ?? "—"}
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatCard
              label="Offers"
              value={offersForView ?? "—"}
              icon={<HeartHandshake className="h-4 w-4" />}
            />
            <StatCard
              label="Hire Rate"
              value={formatRate(hires, totalApplications)}
              icon={<Award className="h-4 w-4" />}
            />
          </div>

          <div className="mt-6">
            <ContentCard
              title="Applications by Status"
              subtitle={selectedJobId ? "For the selected job" : "Across all your jobs"}
            >
              {totalApplications === 0 ? (
                <EmptyState title="No applications yet" />
              ) : (
                <div className="h-64 w-full" role="img" aria-label="Bar chart of applications by status">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#6b7d99" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7d99" }} />
                      <Tooltip cursor={{ fill: "#f6f7f9" }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {statusBreakdown.map((entry) => (
                          <Cell key={entry.status} fill={APPLICATION_STATUS_CHART_COLOR[entry.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ContentCard>
          </div>

          <div className="mt-6">
            <ContentCard
              title="Applications Over Time"
              subtitle={`Based on applied date, ${selectedJobId ? "for the selected job" : "across all your jobs"}`}
            >
              {filteredApplications.length === 0 ? (
                <EmptyState title="No applications in this period." />
              ) : (
                <div className="h-56 w-full" role="img" aria-label="Bar chart of applications over time">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7d99" }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7d99" }} />
                      <Tooltip cursor={{ fill: "#f6f7f9" }} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="mt-2 text-xs text-navy-400">
                Based on applications loaded for {selectedJobId ? "this job" : "your jobs"} (up to 50 per job).
              </p>
            </ContentCard>
          </div>

          {!selectedJobId && (
            <div className="mt-6">
              <ContentCard title="Job Performance" subtitle="Applications received per job" noPadding>
                {jobPerformance.length === 0 ? (
                  <EmptyState title="No applications yet" />
                ) : (
                  <ul className="divide-y divide-surface-border">
                    {jobPerformance.map((job) => (
                      <li key={job.jobId} className="flex items-center justify-between px-5 py-3">
                        <Link
                          to={`/recruiter/jobs/${job.jobId}`}
                          className="text-sm font-medium text-navy-800 hover:text-accent-700"
                        >
                          {job.title}
                        </Link>
                        <span className="text-sm text-navy-500">{job.total} applications</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ContentCard>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
