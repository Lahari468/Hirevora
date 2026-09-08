import { useState, type FormEvent } from "react";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { SkeletonCard } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { JobCard } from "../../components/candidate/JobCard.js";
import { useJobs } from "../../hooks/useJobs.js";
import { useSavedJobs } from "../../hooks/useSavedJobs.js";
import { savedJobService } from "../../services/savedJobService.js";
import { useToast } from "../../context/ToastContext.js";
import type { EmploymentType } from "../../types/index.js";

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

export function FindJobs(): JSX.Element {
  const { jobs, pagination, filters, updateFilters, setPage, isLoading, error, refetch } =
    useJobs();
  const { savedJobs, refetch: refetchSaved } = useSavedJobs();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const savedJobIds = new Set(savedJobs.map((s) => s.jobId));

  const handleSearchSubmit = (e: FormEvent): void => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined, location: locationInput || undefined });
  };

  const handleToggleSave = async (jobId: string): Promise<void> => {
    setSavingJobId(jobId);
    try {
      if (savedJobIds.has(jobId)) {
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
      setSavingJobId(null);
    }
  };

  return (
    <AppShell title="Find Jobs">
      <PageHeader title="Find your next opportunity" description="Search open roles on HireLynk." />

      <form
        onSubmit={handleSearchSubmit}
        className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Keyword"
            placeholder="Job title, skill, or company"
            leadingIcon={<SearchIcon className="h-4 w-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Location"
            placeholder="City, state, or remote"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Employment type"
            placeholder="Any type"
            options={EMPLOYMENT_TYPE_OPTIONS}
            value={filters.employmentType ?? ""}
            onChange={(e) =>
              updateFilters({
                employmentType: (e.target.value as EmploymentType) || undefined,
              })
            }
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && error && <ErrorState description={error} onRetry={refetch} />}

      {!isLoading && !error && jobs.length === 0 && (
        <EmptyState
          title="No jobs match your search"
          description="Try adjusting your filters or searching a different keyword."
        />
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                isSaving={savingJobId === job.id}
                onToggleSave={() => void handleToggleSave(job.id)}
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
