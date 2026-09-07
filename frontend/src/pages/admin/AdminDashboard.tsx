import { Users, Briefcase, Building, ShieldAlert } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { EmptyState } from "../../components/ui/EmptyState.js";

export function AdminDashboard(): JSX.Element {
  return (
    <AppShell title="Dashboard">
      <PageHeader title="Platform Overview" description="Monitor activity across HireLynk." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={0} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Jobs" value={0} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Companies" value={0} icon={<Building className="h-4 w-4" />} />
        <StatCard label="Open Reports" value={0} icon={<ShieldAlert className="h-4 w-4" />} />
      </div>

      <div className="mt-6">
        <ContentCard title="Recent Moderation Activity" noPadding>
          <EmptyState
            title="Nothing to review"
            description="Flagged content and moderation actions will appear here."
          />
        </ContentCard>
      </div>
    </AppShell>
  );
}
