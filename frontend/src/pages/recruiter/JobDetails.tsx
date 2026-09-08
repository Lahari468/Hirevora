import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Briefcase, Wallet, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { Modal } from "../../components/ui/Modal.js";
import { useRecruiterJobDetails } from "../../hooks/useRecruiterJobDetails.js";
import { useJobApplications } from "../../hooks/useJobApplications.js";
import { jobService } from "../../services/jobService.js";
import { useToast } from "../../context/ToastContext.js";
import {
  formatDate,
  formatEmploymentType,
  formatExperienceRange,
  formatSalaryRange,
} from "../../lib/format.js";
import type { ApiResponse, JobApplicationListItem } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function JobDetails(): JSX.Element {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: job, isLoading, error, refetch } = useRecruiterJobDetails(jobId);
  const {
    applications,
    pagination,
    updateFilters,
    isLoading: appsLoading,
  } = useJobApplications(jobId);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const runAction = async (action: () => Promise<unknown>, successMessage: string): Promise<void> => {
    setIsActionLoading(true);
    try {
      await action();
      showToast(successMessage, "success");
      refetch();
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Something went wrong.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!jobId) return;
    setIsActionLoading(true);
    try {
      await jobService.remove(jobId);
      showToast("Job deleted", "info");
      navigate("/recruiter/jobs");
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to delete job.", "error");
      setIsActionLoading(false);
    }
  };

  const columns: TableColumn<JobApplicationListItem>[] = [
    { key: "candidate", header: "Candidate", render: (a) => (
      <div>
        <p className="font-medium text-navy-800">{a.candidate.name}</p>
        <p className="text-xs text-navy-500">{a.candidate.email}</p>
      </div>
    ) },
    { key: "applied", header: "Applied", render: (a) => formatDate(a.appliedAt) },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "updated", header: "Updated", render: (a) => formatDate(a.updatedAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <Link
          to={`/recruiter/applications/${a.id}`}
          className="text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          View
        </Link>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AppShell title="Job Details">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !job) {
    return (
      <AppShell title="Job Details">
        <ErrorState description={error ?? "This job could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);
  const experience = formatExperienceRange(job.experienceMin, job.experienceMax);

  return (
    <AppShell title="Job Details">
      <PageHeader
        title={job.title}
        breadcrumb={job.company.name}
        actions={
          <>
            <StatusBadge status={job.status} />
            {job.status === "DRAFT" && (
              <>
                <Link to={`/recruiter/jobs/${job.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button size="sm" isLoading={isActionLoading} onClick={() => void runAction(() => jobService.publish(job.id), "Job published")}>
                  Publish
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 text-danger-600" />
                </Button>
              </>
            )}
            {job.status === "OPEN" && (
              <Button
                variant="outline"
                size="sm"
                isLoading={isActionLoading}
                onClick={() => void runAction(() => jobService.close(job.id), "Job closed")}
              >
                Close job
              </Button>
            )}
          </>
        }
      />

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
              <p className="mt-3 text-xs text-navy-400">Created {formatDate(job.createdAt)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-base font-semibold text-navy-900">Job description</h2>
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
              <p className="mt-1 text-2xl font-semibold text-navy-900">
                {appsLoading ? "–" : pagination?.total ?? 0}
              </p>
              <p className="text-xs text-navy-500">Total applicants for this role</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
        <CardHeader title="Applications for this job" />
        {appsLoading ? (
          <table className="w-full text-left text-sm">
            <tbody>
              <SkeletonTableRows rows={4} cols={5} />
            </tbody>
          </table>
        ) : applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Applications will appear here once candidates apply." />
        ) : (
          <Table columns={columns} data={applications} rowKey={(a) => a.id} />
        )}
      </div>
      {!appsLoading && pagination && applications.length > 0 && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.limit}
          total={pagination.total}
          onPageChange={(page) => updateFilters({ page })}
        />
      )}

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete this job?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isActionLoading} onClick={() => void handleDelete()}>
              Delete job
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          This will permanently delete the draft job "{job.title}". This action cannot be undone.
        </p>
      </Modal>
    </AppShell>
  );
}
