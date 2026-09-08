import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Button } from "../../components/ui/Button.js";
import { SkeletonCard } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { JobCard } from "../../components/candidate/JobCard.js";
import { useSavedJobs } from "../../hooks/useSavedJobs.js";
import { useToast } from "../../context/ToastContext.js";

export function SavedJobs(): JSX.Element {
  const { savedJobs, pagination, setPage, isLoading, error, refetch, unsave } =
    useSavedJobs();
  const { showToast } = useToast();

  const handleUnsave = async (jobId: string): Promise<void> => {
    try {
      await unsave(jobId);
      showToast("Removed from saved jobs", "info");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <AppShell title="Saved Jobs">
      <PageHeader title="Saved Jobs" description="Roles you've bookmarked to review later." />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && error && <ErrorState description={error} onRetry={refetch} />}

      {!isLoading && !error && savedJobs.length === 0 && (
        <EmptyState
          title="No saved jobs yet"
          description="Bookmark roles you're interested in so you can find them here later."
          action={
            <Link to="/candidate/jobs">
              <Button size="sm">Explore jobs</Button>
            </Link>
          }
        />
      )}

      {!isLoading && !error && savedJobs.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                isSaved
                onToggleSave={() => void handleUnsave(job.jobId)}
              />
            ))}
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
