import { useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { useAdminUser } from "../../hooks/useAdminUser.js";
import { formatDateTime } from "../../lib/format.js";

export function UserDetails(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, error, refetch } = useAdminUser(userId);

  if (isLoading) {
    return (
      <AppShell title="User">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !user) {
    return (
      <AppShell title="User">
        <ErrorState description={error ?? "This user could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell title="User">
      <PageHeader
        title={user.name}
        breadcrumb={user.role}
        actions={<Badge variant={user.isActive ? "success" : "neutral"}>{user.isActive ? "Active" : "Inactive"}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Basic information" />
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-500">Email</span>
              <span className="text-navy-800">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Role</span>
              <span className="text-navy-800">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Created</span>
              <span className="text-navy-800">{formatDateTime(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Last updated</span>
              <span className="text-navy-800">{formatDateTime(user.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {user.candidateProfile && (
          <Card>
            <CardHeader title="Candidate profile" />
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Headline</span>
                <span className="text-navy-800">{user.candidateProfile.headline ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Location</span>
                <span className="text-navy-800">{user.candidateProfile.location ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {user.recruiterProfile && (
          <Card>
            <CardHeader title="Recruiter profile" />
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Job title</span>
                <span className="text-navy-800">{user.recruiterProfile.jobTitle ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Company</span>
                <span className="text-navy-800">{user.recruiterProfile.company?.name ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
