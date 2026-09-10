import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card } from "../../components/ui/Card.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Button } from "../../components/ui/Button.js";

/**
 * There is no admin-level applications endpoint in the backend (no
 * /api/admin/applications route exists — only the per-job recruiter
 * endpoints and the candidate's own /applications/mine). Rather than
 * fabricate a cross-platform aggregation, this page is honest about that
 * gap: application volume is visible per-job from the Jobs page
 * ("Applications" column, and the count on a job's detail page), and the
 * status breakdown is visible platform-wide on the Dashboard.
 */
export function ApplicationsOverview(): JSX.Element {
  return (
    <AppShell title="Applications">
      <PageHeader
        title="Applications"
        description="Platform-wide application activity."
      />
      <Card>
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No admin-level applications endpoint exists yet"
          description="The backend doesn't expose a cross-platform application list for admins. You can see application counts per job from the Jobs page, and the full status breakdown on the Dashboard."
          action={
            <div className="flex gap-2">
              <Link to="/admin/jobs">
                <Button size="sm" variant="outline">
                  View jobs
                </Button>
              </Link>
              <Link to="/admin/dashboard">
                <Button size="sm">View dashboard</Button>
              </Link>
            </div>
          }
        />
      </Card>
    </AppShell>
  );
}
