import { Link } from "react-router-dom";
import { Users, Briefcase, Building, ShieldAlert, FileText, UserCog } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Button } from "../../components/ui/Button.js";
import { useAdminDashboard } from "../../hooks/useAdminDashboard.js";

export function AdminDashboard(): JSX.Element {
  const { data: stats, isLoading, error, refetch } = useAdminDashboard();

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of HireLynk activity and platform health."
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
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Companies" value={stats.totalCompanies} icon={<Building className="h-4 w-4" />} />
            <StatCard label="Total Jobs" value={stats.totalJobs} icon={<Briefcase className="h-4 w-4" />} />
            <StatCard
              label="Applications"
              value={stats.totalApplications}
              icon={<FileText className="h-4 w-4" />}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ContentCard title="User Breakdown" subtitle="By role">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-navy-600">Candidates</span>
                  <span className="font-medium text-navy-900">{stats.candidateCount}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-navy-600">Recruiters</span>
                  <span className="font-medium text-navy-900">{stats.recruiterCount}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-navy-600">Admins</span>
                  <span className="font-medium text-navy-900">{stats.adminCount}</span>
                </li>
              </ul>
            </ContentCard>

            <ContentCard title="Job Breakdown" subtitle="By status">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-navy-600">Open</span>
                  <span className="font-medium text-navy-900">{stats.openJobs}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-navy-600">Draft</span>
                  <span className="font-medium text-navy-900">{stats.draftJobs}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-navy-600">Closed</span>
                  <span className="font-medium text-navy-900">{stats.closedJobs}</span>
                </li>
              </ul>
            </ContentCard>
          </div>

          <div className="mt-6">
            <ContentCard title="Applications by Status">
              <ul className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
                  <li key={status} className="rounded-md bg-surface-muted px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-navy-400">{status}</p>
                    <p className="mt-0.5 text-lg font-semibold text-navy-900">{count}</p>
                  </li>
                ))}
              </ul>
            </ContentCard>
          </div>

          <div className="mt-6">
            <ContentCard title="Quick actions">
              <div className="flex flex-wrap gap-3">
                <Link to="/admin/users">
                  <Button variant="outline" size="sm">
                    <UserCog className="h-4 w-4" />
                    Manage users
                  </Button>
                </Link>
                <Link to="/admin/reports">
                  <Button variant="outline" size="sm">
                    <ShieldAlert className="h-4 w-4" />
                    Review reports
                  </Button>
                </Link>
                <Link to="/admin/jobs">
                  <Button variant="outline" size="sm">
                    <Briefcase className="h-4 w-4" />
                    Manage jobs
                  </Button>
                </Link>
                <Link to="/admin/audit-logs">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                    View audit logs
                  </Button>
                </Link>
              </div>
            </ContentCard>
          </div>
        </>
      )}
    </AppShell>
  );
}
