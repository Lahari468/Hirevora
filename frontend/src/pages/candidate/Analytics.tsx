import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Send, CalendarClock, HeartHandshake, Bookmark, TrendingUp, Search } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { useCandidateAnalytics } from "../../hooks/useCandidateAnalytics.js";
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
  const { applications, interviewTotal, offerTotal, savedJobsTotal, isLoading, error, refetch } =
    useCandidateAnalytics();
  const [rangeDays, setRangeDays] = useState(30);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<ApplicationStatus, number>(STAGE_ORDER.map((s) => [s, 0]));
    for (const app of applications) {
      counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
    }
    return STAGE_ORDER.map((status) => ({ status, count: counts.get(status) ?? 0 }));
  }, [applications]);

  const timeSeries = useMemo(
    () => bucketByDay(applications.map((a) => a.appliedAt), rangeDays),
    [applications, rangeDays]
  );

  const hired = applications.filter((a) => a.status === "HIRED").length;

  return (
    <AppShell title="Analytics">
      <PageHeader
        title="My Job Search Analytics"
        description="How is your job search progressing?"
        actions={
          <div className="w-40">
            <Select
              options={RANGE_OPTIONS}
              value={String(rangeDays)}
              onChange={(e) => setRangeDays(Number(e.target.value))}
            />
          </div>
        }
      />

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Apply to jobs to start seeing your job search analytics here."
          action={
            <Link to="/candidate/jobs">
              <Button size="sm">
                <Search className="h-4 w-4" />
                Find jobs
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Applications Sent" value={applications.length} icon={<Send className="h-4 w-4" />} />
            <StatCard
              label="Interviews Scheduled"
              value={interviewTotal ?? "—"}
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatCard
              label="Offers Received"
              value={offerTotal ?? "—"}
              icon={<HeartHandshake className="h-4 w-4" />}
            />
            <StatCard label="Saved Jobs" value={savedJobsTotal ?? "—"} icon={<Bookmark className="h-4 w-4" />} />
          </div>

          <div className="mt-6">
            <ContentCard title="Applications by Status">
              <div className="h-64 w-full" role="img" aria-label="Bar chart of your applications by status">
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
            </ContentCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ContentCard title="Applications Over Time" subtitle="Based on applied date">
              <div className="h-56 w-full" role="img" aria-label="Bar chart of your applications over time">
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
            </ContentCard>

            <ContentCard title="Success Rate" subtitle="Hired out of all applications submitted">
              <div className="flex h-56 flex-col items-center justify-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-600">
                  <TrendingUp className="h-6 w-6" />
                </span>
                <p className="text-3xl font-semibold text-navy-900">
                  {formatRate(hired, applications.length)}
                </p>
                <p className="text-sm text-navy-500">
                  {hired} hired out of {applications.length} application{applications.length === 1 ? "" : "s"}
                </p>
              </div>
            </ContentCard>
          </div>
        </>
      )}
    </AppShell>
  );
}
