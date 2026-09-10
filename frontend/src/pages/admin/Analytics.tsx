import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Briefcase, FileText, ShieldAlert } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics.js";
import { APPLICATION_STATUS_CHART_COLOR, CHART_COLORS } from "../../lib/chartColors.js";
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

const REPORT_STATUS_COLOR: Record<string, string> = {
  PENDING: CHART_COLORS.warning500,
  REVIEWING: CHART_COLORS.info500,
  RESOLVED: CHART_COLORS.success500,
  DISMISSED: CHART_COLORS.navy400,
};

/**
 * Reuses the same GET /admin/dashboard endpoint the Admin Dashboard already
 * calls (see useAdminAnalytics -> useAdminDashboard) — no duplicate backend
 * call, just an analytics-focused view of the same real aggregates, plus a
 * real moderation breakdown from /admin/reports counts. No historical
 * snapshots exist anywhere in the backend, so no platform-growth-over-time
 * chart is shown (see Phase 25 report for why).
 */
export function Analytics(): JSX.Element {
  const { stats, reportCounts, isLoading, error, refetch } = useAdminAnalytics();

  const userBreakdown = useMemo(() => {
    if (!stats) return [];
    return [
      { role: "Candidates", count: stats.candidateCount },
      { role: "Recruiters", count: stats.recruiterCount },
      { role: "Admins", count: stats.adminCount },
    ];
  }, [stats]);

  const jobBreakdown = useMemo(() => {
    if (!stats) return [];
    return [
      { status: "Open", count: stats.openJobs },
      { status: "Draft", count: stats.draftJobs },
      { status: "Closed", count: stats.closedJobs },
    ];
  }, [stats]);

  const applicationBreakdown = useMemo(() => {
    if (!stats) return [];
    return STAGE_ORDER.map((status) => ({ status, count: stats.applicationsByStatus[status] ?? 0 }));
  }, [stats]);

  const reportBreakdown = useMemo(() => {
    if (!reportCounts) return [];
    return Object.entries(reportCounts).map(([status, count]) => ({ status, count }));
  }, [reportCounts]);

  return (
    <AppShell title="Analytics">
      <PageHeader title="Platform Analytics" description="How healthy is the HireLynk platform?" />

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading || !stats ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Total Jobs" value={stats.totalJobs} icon={<Briefcase className="h-4 w-4" />} />
            <StatCard
              label="Total Applications"
              value={stats.totalApplications}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard
              label="Open Reports"
              value={(reportCounts?.PENDING ?? 0) + (reportCounts?.REVIEWING ?? 0)}
              icon={<ShieldAlert className="h-4 w-4" />}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ContentCard title="Users by Role">
              <div className="h-56 w-full" role="img" aria-label="Bar chart of users by role">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                    <XAxis dataKey="role" tick={{ fontSize: 11, fill: "#6b7d99" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7d99" }} />
                    <Tooltip cursor={{ fill: "#f6f7f9" }} />
                    <Bar dataKey="count" fill={CHART_COLORS.accent600} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ContentCard>

            <ContentCard title="Jobs by Status">
              <div className="h-56 w-full" role="img" aria-label="Bar chart of jobs by status">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#6b7d99" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7d99" }} />
                    <Tooltip cursor={{ fill: "#f6f7f9" }} />
                    <Bar dataKey="count" fill={CHART_COLORS.navy900} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ContentCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ContentCard title="Applications by Status" subtitle="Across the entire platform">
              <div className="h-64 w-full" role="img" aria-label="Bar chart of applications by status">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#6b7d99" }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7d99" }} />
                    <Tooltip cursor={{ fill: "#f6f7f9" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {applicationBreakdown.map((entry) => (
                        <Cell key={entry.status} fill={APPLICATION_STATUS_CHART_COLOR[entry.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ContentCard>

            <ContentCard title="Reports by Status" subtitle="Moderation queue breakdown">
              {reportBreakdown.length === 0 ? (
                <p className="py-10 text-center text-sm text-navy-500">No reports have been submitted yet.</p>
              ) : (
                <div className="h-64 w-full" role="img" aria-label="Bar chart of reports by status">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#6b7d99" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7d99" }} />
                      <Tooltip cursor={{ fill: "#f6f7f9" }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {reportBreakdown.map((entry) => (
                          <Cell key={entry.status} fill={REPORT_STATUS_COLOR[entry.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ContentCard>
          </div>
        </>
      )}
    </AppShell>
  );
}
