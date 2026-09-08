import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Briefcase, Wallet, GraduationCap, Bookmark, BookmarkCheck } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { ApplyModal } from "../../components/candidate/ApplyModal.js";
import { useJobDetails } from "../../hooks/useJobDetails.js";
import { useSavedJobs } from "../../hooks/useSavedJobs.js";
import { useApplications } from "../../hooks/useApplications.js";
import { savedJobService } from "../../services/savedJobService.js";
import { useToast } from "../../context/ToastContext.js";
import {
  formatDate,
  formatEmploymentType,
  formatExperienceRange,
  formatSalaryRange,
} from "../../lib/format.js";

export function JobDetails(): JSX.Element {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: job, isLoading, error, refetch } = useJobDetails(jobId);
  const { savedJobs, refetch: refetchSaved } = useSavedJobs();
  const { applications } = useApplications({ page: 1, limit: 50 });
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const existingApplication = applications.find((a) => a.job?.id === jobId);
  const isSaved = savedJobs.some((s) => s.jobId === jobId);

  const handleToggleSave = async (): Promise<void> => {
    if (!jobId) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await savedJobService.unsave(jobId);
        showToast("Removed from saved jobs", "info");
      } else {
        await savedJobService.save(jobId);
        showToast("Job saved", "success");
      }
      refetchSaved();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
  const isClosed = job.status !== "OPEN";

  return (
    <AppShell title="Job Details">
      <PageHeader
        title={job.title}
        breadcrumb={job.company.name}
        actions={
          <button
            type="button"
            onClick={() => void handleToggleSave()}
            disabled={isSaving}
            className="focus-ring flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-1.5 text-sm font-medium text-navy-600 hover:bg-surface-muted disabled:opacity-50"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-accent-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isSaved ? "Saved" : "Save job"}
          </button>
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
              <p className="mt-3 text-xs text-navy-400">Posted {formatDate(job.createdAt)}</p>
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
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm font-medium text-navy-700">Ready to apply?</p>
              {existingApplication ? (
                <>
                  <Badge variant="success" className="w-fit">
                    Already applied
                  </Badge>
                  <Link to={`/candidate/applications/${existingApplication.id}`}>
                    <Button variant="outline" className="w-full">
                      View application
                    </Button>
                  </Link>
                </>
              ) : isClosed ? (
                <Button disabled className="w-full">
                  Applications closed
                </Button>
              ) : (
                <Button className="w-full" onClick={() => setIsApplyOpen(true)}>
                  Apply now
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-navy-900">About {job.company.name}</h3>
              <p className="mt-1 text-sm text-navy-500">
                Hiring for {formatEmploymentType(job.employmentType)} roles in {job.location}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {jobId && (
        <ApplyModal
          jobId={jobId}
          jobTitle={job.title}
          isOpen={isApplyOpen}
          onClose={() => setIsApplyOpen(false)}
          onSuccess={(applicationId) => {
            setIsApplyOpen(false);
            navigate(`/candidate/applications/${applicationId}`);
          }}
        />
      )}
    </AppShell>
  );
}
