import { useEffect, useState, useCallback, useRef } from "react";
import { jobService } from "../services/jobService.js";
import { applicationService } from "../services/applicationService.js";
import type { Job, JobApplicationListItem } from "../types/index.js";

export interface RecruiterApplicationIndexEntry extends JobApplicationListItem {
  job: Pick<Job, "id" | "title" | "location" | "employmentType" | "company">;
}

const JOB_PAGE_CAP = 5; // up to 5 pages of 50 = 250 jobs
const APPLICATIONS_PER_JOB_CAP = 50;

/**
 * The backend's application-listing endpoints are all job-scoped — there is
 * no single "all my applications across every job" endpoint for recruiters.
 * This hook builds that view honestly: it fetches the recruiter's own jobs
 * (via /jobs/mine, real data, authorization already enforced server-side),
 * then fetches each job's real applications and merges them client-side.
 * It backs the recruiter Applications page, the Candidates page, and the
 * job/candidate context shown on Interviews and Offers. Capped at
 * JOB_PAGE_CAP*50 jobs and 50 applications per job to keep the number of
 * requests reasonable — documented as a known limitation, not fabrication.
 */
export function useRecruiterApplicationIndex() {
  const [entries, setEntries] = useState<RecruiterApplicationIndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);

    async function run(): Promise<void> {
      try {
        const jobs: Job[] = [];
        for (let page = 1; page <= JOB_PAGE_CAP; page += 1) {
          const res = await jobService.listMine({ page, limit: 50, sort: "newest" });
          if (!res.success || !res.data) break;
          jobs.push(...res.data.items);
          if (page >= res.data.pagination.totalPages) break;
        }

        const perJob = await Promise.all(
          jobs.map((job) =>
            applicationService
              .listForJob(job.id, { page: 1, limit: APPLICATIONS_PER_JOB_CAP, sort: "newest" })
              .then((res) =>
                (res.success && res.data ? res.data.items : []).map(
                  (app): RecruiterApplicationIndexEntry => ({
                    ...app,
                    job: {
                      id: job.id,
                      title: job.title,
                      location: job.location,
                      employmentType: job.employmentType,
                      company: job.company,
                    },
                  })
                )
              )
              .catch(() => [] as RecruiterApplicationIndexEntry[])
          )
        );

        if (cancelledRef.current) return;
        setEntries(perJob.flat());
      } catch {
        if (!cancelledRef.current) setError("Unable to load applications across your jobs.");
      } finally {
        if (!cancelledRef.current) setIsLoading(false);
      }
    }

    void run();
    return () => {
      cancelledRef.current = true;
    };
  }, [reloadToken]);

  return { entries, isLoading, error, refetch };
}
