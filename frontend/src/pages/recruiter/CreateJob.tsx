import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { JobForm } from "../../components/recruiter/JobForm.js";
import { jobService } from "../../services/jobService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse, CreateJobPayload } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function CreateJob(): JSX.Element {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (payload: CreateJobPayload): Promise<void> => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await jobService.create(payload);
      if (res.success && res.data) {
        showToast("Job created as a draft", "success");
        navigate(`/recruiter/jobs/${res.data.id}`);
      } else {
        setServerError(res.message);
      }
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Create Job">
      <PageHeader
        title="Create a new job"
        description="Jobs start as a draft — you can review and publish them from the job details page."
      />
      <Card>
        <CardContent>
          <JobForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Create job"
            serverError={serverError}
          />
        </CardContent>
      </Card>
    </AppShell>
  );
}
