import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { formatDate } from "../../lib/format.js";
import { useRecruiterApplicationsIndex } from "../../hooks/useRecruiterApplicationsIndex.js";

/**
 * The backend has no standalone "get candidate by id" endpoint for
 * recruiters — candidate information is only reachable through an
 * application (GET /applications/:id/recruiter). This page lists the
 * distinct candidates who've applied to the recruiter's jobs (deduplicated
 * from the real, aggregated application data) and links each one to their
 * most recent application, which is where their full profile actually
 * lives per the backend's authorization model.
 */
export function Candidates(): JSX.Element {
  const { applications, isLoading, error, refetch } = useRecruiterApplicationsIndex();
  const [search, setSearch] = useState("");

  const candidates = useMemo(() => {
    const byCandidate = new Map<
      string,
      { id: string; name: string; email: string; latestApplicationId: string; jobTitle: string; status: string; appliedAt: string }
    >();
    for (const app of applications) {
      const existing = byCandidate.get(app.candidate.id);
      if (!existing || new Date(app.appliedAt) > new Date(existing.appliedAt)) {
        byCandidate.set(app.candidate.id, {
          id: app.candidate.id,
          name: app.candidate.name,
          email: app.candidate.email,
          latestApplicationId: app.id,
          jobTitle: app.job.title,
          status: app.status,
          appliedAt: app.appliedAt,
        });
      }
    }
    return Array.from(byCandidate.values()).sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
  }, [applications]);

  const filtered = useMemo(() => {
    if (!search.trim()) return candidates;
    const q = search.trim().toLowerCase();
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  return (
    <AppShell title="Candidates">
      <PageHeader title="Candidates" description="Everyone who has applied to your jobs." />

      <div className="mb-4 w-full sm:w-72">
        <Input
          placeholder="Search by name or email"
          leadingIcon={<SearchIcon className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No candidates yet" description="Candidates will appear here once they apply to your jobs." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
          <ul className="divide-y divide-surface-border">
            {filtered.map((candidate) => (
              <li key={candidate.id}>
                <Link
                  to={`/recruiter/applications/${candidate.latestApplicationId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted"
                >
                  <Avatar name={candidate.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-800">{candidate.name}</p>
                    <p className="truncate text-xs text-navy-500">
                      {candidate.email} · Applied to {candidate.jobTitle}
                    </p>
                  </div>
                  <StatusBadge status={candidate.status} />
                  <span className="shrink-0 text-xs text-navy-400">{formatDate(candidate.appliedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
