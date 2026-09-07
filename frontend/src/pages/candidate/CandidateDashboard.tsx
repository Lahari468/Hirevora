import { FileText, Bookmark, CalendarClock, Send } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { Schedule } from "../../components/dashboard/Schedule.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { useAuth } from "../../context/AuthContext.js";

/**
 * Foundation dashboard: demonstrates the KPI/content-card/schedule visual
 * language with the shape of real data. Live application/interview data is
 * wired up in a later phase — for now this establishes the layout.
 */
export function CandidateDashboard(): JSX.Element {
  const { user } = useAuth();

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's an overview of your job search."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={0} icon={<Send className="h-4 w-4" />} />
        <StatCard label="Saved Jobs" value={0} icon={<Bookmark className="h-4 w-4" />} />
        <StatCard label="Interviews" value={0} icon={<CalendarClock className="h-4 w-4" />} />
        <StatCard label="Resume Views" value={0} icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard title="Recent Applications" className="lg:col-span-2" noPadding>
          <EmptyState
            title="No applications yet"
            description="Jobs you apply to will show up here so you can track their status."
          />
        </ContentCard>

        <ContentCard title="Upcoming Interviews" noPadding>
          <Schedule items={[]} emptyMessage="No interviews scheduled" />
        </ContentCard>
      </div>
    </AppShell>
  );
}
