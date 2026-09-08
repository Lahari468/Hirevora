import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { JobForm } from "../../components/recruiter/JobForm.js";
import { useRecruiterJobDetails } from "../../hooks/useRecruiterJobDetails.js";
import { jobService } from "../../services/jobService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse, UpdateJobPayload } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function EditJob(): JSX.Element {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: job, isLoading, error, refetch } = useRecruiterJobDetails(jobId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (payload: UpdateJobPayload): Promise<void> => {
    if (!jobId) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await jobService.update(jobId, payload);
      if (res.success && res.data) {
        showToast("Job updated", "success");
        navigate(`/recruiter/jobs/${res.data.id}`);
      } else {
        setServerError(res.message);
      }
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Edit Job">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !job) {
    return (
      <AppShell title="Edit Job">
        <ErrorState description={error ?? "This job could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  if (job.status !== "DRAFT") {
    return (
      <AppShell title="Edit Job">
        <PageHeader title={job.title} breadcrumb={job.company.name} />
        <Card>
          <CardContent>
            <p className="text-sm text-navy-600">
              Only draft jobs can be edited. This job is <strong>{job.status.toLowerCase()}</strong>, so its
              details are locked.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Job">
      <PageHeader title={`Edit ${job.title}`} breadcrumb={job.company.name} />
      <Card>
        <CardContent>
          <JobForm
            defaultValues={{
              title: job.title,
              description: job.description,
              location: job.location,
              employmentType: job.employmentType,
              experienceRequired: job.experienceMin ?? undefined,
              salaryMin: job.salaryMin ?? undefined,
              salaryMax: job.salaryMax ?? undefined,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Save changes"
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </AppShell>
  );
}
