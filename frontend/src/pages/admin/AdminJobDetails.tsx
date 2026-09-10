import { useParams } from "react-router-dom";
import { MapPin, Briefcase, Wallet, GraduationCap, Mail } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { useAdminJob } from "../../hooks/useAdminJob.js";
import {
  formatDate,
  formatEmploymentType,
  formatExperienceRange,
  formatSalaryRange,
} from "../../lib/format.js";

export function AdminJobDetails(): JSX.Element {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: job, isLoading, error, refetch } = useAdminJob(jobId);

  if (isLoading) {
    return (
      <AppShell title="Job">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !job) {
    return (
      <AppShell title="Job">
        <ErrorState description={error ?? "This job could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);
  const experience = formatExperienceRange(job.experienceMin, job.experienceMax);

  return (
    <AppShell title="Job">
      <PageHeader title={job.title} breadcrumb={job.company.name} actions={<StatusBadge status={job.status} />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-navy-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-navy-400" />
                  {formatEmploymentType(job.employmentType)}
                </span>
                {salary && (
                  <span className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-navy-400" />
                    {salary}
                  </span>
                )}
                {experience && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-navy-400" />
                    {experience} experience
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-navy-400">
                Created {formatDate(job.createdAt)} · Updated {formatDate(job.updatedAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-base font-semibold text-navy-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-700">
                {job.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-navy-900">Applications</h3>
              <p className="mt-1 text-2xl font-semibold text-navy-900">{job._count.applications}</p>
              <p className="text-xs text-navy-500">Total applicants for this role</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Recruiter" />
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-navy-800">{job.recruiter.name}</p>
              <p className="flex items-center gap-1.5 text-navy-500">
                <Mail className="h-3.5 w-3.5" />
                {job.recruiter.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Company" />
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-navy-800">{job.company.name}</p>
              {job.company.location && <p className="text-navy-500">{job.company.location}</p>}
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-accent-600 hover:text-accent-700"
                >
                  {job.company.website}
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
