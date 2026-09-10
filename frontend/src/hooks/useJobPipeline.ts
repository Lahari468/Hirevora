import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { applicationService } from "../services/applicationService.js";
import type { JobApplicationListItem } from "../types/index.js";

const PAGE_LIMIT = 50; // the backend's page-size ceiling for this endpoint

/**
 * Loads every application for a single job, not just the first page. The
 * ATS needs accurate per-stage counts across the whole job, so this loops
 * through /recruiters/jobs/:jobId/applications at the API's max page size
 * until all pages are fetched, rather than silently showing page 1 and
 * implying the pipeline is complete (a job with more applicants than one
 * page would otherwise look wrong). Search is sent to the backend on each
 * page request, so it stays a real server-side search, not a client-side
 * filter over partial data.
 */
export function useJobPipeline(jobId: string | undefined, search: string) {
  const [reloadToken, setReloadToken] = useState(0);

  const fetcher = useCallback(async () => {
    if (!jobId) {
      return { success: true, message: "", data: [] as JobApplicationListItem[] };
    }
    const all: JobApplicationListItem[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await applicationService.listForJob(jobId, {
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        sort: "newest",
      });
      if (!res.success || !res.data) {
        return { success: false as const, message: res.message, error: res.error };
      }
      all.push(...res.data.items);
      totalPages = res.data.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);

    return { success: true, message: "", data: all };
  }, [jobId, search]);

  const { data, isLoading, error } = useAsync<JobApplicationListItem[]>(fetcher, [
    jobId,
    search,
    reloadToken,
  ]);

  return {
    applications: data ?? [],
    isLoading,
    error,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
