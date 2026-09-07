import { Briefcase, Users, HeartHandshake, FileText } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatCard } from "../../components/dashboard/StatCard.js";
import { ContentCard } from "../../components/dashboard/ContentCard.js";
import { Pipeline } from "../../components/dashboard/Pipeline.js";
import { Schedule } from "../../components/dashboard/Schedule.js";
import { useAuth } from "../../context/AuthContext.js";

export function RecruiterDashboard(): JSX.Element {
  const { user } = useAuth();

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's how your open roles are progressing."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Jobs" value={0} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Candidates" value={0} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Applications" value={0} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Offers Out" value={0} icon={<HeartHandshake className="h-4 w-4" />} />
      </div>

      <div className="mt-6">
        <ContentCard title="Hiring Pipeline" subtitle="Across all open roles">
          <Pipeline
            stages={[
              { key: "applied", label: "Applied", count: 0 },
              { key: "screening", label: "Screening", count: 0 },
              { key: "interview", label: "Interview", count: 0 },
              { key: "offer", label: "Offer", count: 0 },
              { key: "hired", label: "Hired", count: 0 },
            ]}
          />
        </ContentCard>
      </div>

      <div className="mt-6">
        <ContentCard title="Upcoming Interviews" noPadding>
          <Schedule items={[]} emptyMessage="No interviews scheduled" />
        </ContentCard>
      </div>
    </AppShell>
  );
}
