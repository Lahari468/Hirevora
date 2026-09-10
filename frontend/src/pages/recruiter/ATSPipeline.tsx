import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Plus } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Select } from "../../components/ui/Select.js";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { Modal } from "../../components/ui/Modal.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { Skeleton } from "../../components/ui/Skeleton.js";
import { PipelineCard } from "../../components/recruiter/ats/PipelineCard.js";
import { CandidateQuickView } from "../../components/recruiter/ats/CandidateQuickView.js";
import { ScheduleInterviewModal } from "../../components/recruiter/ScheduleInterviewModal.js";
import { CreateOfferModal } from "../../components/recruiter/CreateOfferModal.js";
import { useRecruiterJobs } from "../../hooks/useRecruiterJobs.js";
import { useJobPipeline } from "../../hooks/useJobPipeline.js";
import { useApplicationIndicators } from "../../hooks/useApplicationIndicators.js";
import { applicationService } from "../../services/applicationService.js";
import { useToast } from "../../context/ToastContext.js";
import { cn } from "../../lib/cn.js";
import { APPLICATION_STATUS_TRANSITIONS } from "../../types/index.js";
import type { ApiResponse, ApplicationStatus, JobApplicationListItem } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

/** Real ApplicationStatus enum, in actual pipeline order (backend/src/services/applicationService.ts validTransitions). */
const STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENING", label: "Screening" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected" },
];

const STAGE_HEADER_CLASS: Record<ApplicationStatus, string> = {
  APPLIED: "border-t-navy-300",
  SCREENING: "border-t-warning-500",
  SHORTLISTED: "border-t-info-500",
  INTERVIEW: "border-t-info-600",
  OFFER: "border-t-accent-500",
  HIRED: "border-t-success-500",
  REJECTED: "border-t-danger-500",
};

interface PendingMove {
  application: JobApplicationListItem;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
}

interface DragState {
  applicationId: string;
  fromStatus: ApplicationStatus;
}

export function ATSPipeline(): JSX.Element {
  const { showToast } = useToast();
  const { jobs, isLoading: jobsLoading } = useRecruiterJobs({ page: 1, limit: 50, sort: "newest" });
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [mobileStage, setMobileStage] = useState<ApplicationStatus>("APPLIED");

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Default to the recruiter's most recently created job once jobs load.
  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const {
    applications: fetchedApplications,
    isLoading: pipelineLoading,
    error: pipelineError,
    refetch: refetchPipeline,
  } = useJobPipeline(selectedJobId || undefined, committedSearch);

  const { interviewByApplicationId, offerByApplicationId } = useApplicationIndicators();

  // Local copy so drag-and-drop can update optimistically, then reconcile with refetch().
  const [applications, setApplications] = useState<JobApplicationListItem[]>([]);
  useEffect(() => setApplications(fetchedApplications), [fetchedApplications]);

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStatus | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [quickViewApplicationId, setQuickViewApplicationId] = useState<string | null>(null);
  const [scheduleModalApplicationId, setScheduleModalApplicationId] = useState<string | null>(null);
  const [offerModalApplicationId, setOfferModalApplicationId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<ApplicationStatus, JobApplicationListItem[]>();
    for (const stage of STAGES) map.set(stage.key, []);
    for (const app of applications) {
      map.get(app.status)?.push(app);
    }
    return map;
  }, [applications]);

  const scheduledInterviewCount = useMemo(
    () =>
      applications.filter((a) => interviewByApplicationId.get(a.id)?.status === "SCHEDULED").length,
    [applications, interviewByApplicationId]
  );
  const offerCount = useMemo(
    () => applications.filter((a) => offerByApplicationId.has(a.id)).length,
    [applications, offerByApplicationId]
  );

  const handleSearchSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setCommittedSearch(searchInput.trim());
  };

  const applyMove = async (move: PendingMove): Promise<void> => {
    const { application, toStatus } = move;
    setUpdatingIds((prev) => new Set(prev).add(application.id));
    setApplications((prev) =>
      prev.map((a) => (a.id === application.id ? { ...a, status: toStatus } : a))
    );
    try {
      const res = await applicationService.updateStatus(application.id, { status: toStatus });
      if (res.success) {
        showToast(`${application.candidate.name} moved to ${toStatus}`, "success");
        refetchPipeline();
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === application.id ? { ...a, status: move.fromStatus } : a))
        );
        showToast(res.message, "error");
      }
    } catch (err) {
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? { ...a, status: move.fromStatus } : a))
      );
      showToast(isApiResponse(err) ? err.message : "Unable to update status.", "error");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(application.id);
        return next;
      });
    }
  };

  const requestMove = (
    application: JobApplicationListItem,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus
  ): void => {
    if (fromStatus === toStatus) return;
    if (!APPLICATION_STATUS_TRANSITIONS[fromStatus].includes(toStatus)) {
      showToast(`Cannot move an application from ${fromStatus} to ${toStatus}.`, "error");
      return;
    }
    if (toStatus === "REJECTED") {
      setPendingMove({ application, fromStatus, toStatus });
      return;
    }
    void applyMove({ application, fromStatus, toStatus });
  };

  const handleDrop = (toStatus: ApplicationStatus): void => {
    setDragOverStage(null);
    if (!dragState) return;
    const application = applications.find((a) => a.id === dragState.applicationId);
    setDragState(null);
    if (!application) return;
    requestMove(application, dragState.fromStatus, toStatus);
  };

  const quickViewApp = applications.find((a) => a.id === quickViewApplicationId);

  return (
    <AppShell title="Recruitment Pipeline">
      <PageHeader
        title="Recruitment Pipeline"
        description="Track candidates through every stage of the hiring process."
      />

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end">
        <div className="w-full sm:w-72">
          <Select
            label="Job"
            placeholder={jobsLoading ? "Loading jobs..." : "Select a job"}
            options={jobs.map((j) => ({ value: j.id, label: j.title }))}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={jobsLoading || jobs.length === 0}
          />
        </div>
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-end gap-3">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by candidate name or email"
              leadingIcon={<SearchIcon className="h-4 w-4" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={!selectedJobId}
            />
          </div>
          <Button type="submit" disabled={!selectedJobId}>
            Search
          </Button>
        </form>
      </div>

      {!jobsLoading && jobs.length === 0 ? (
        <EmptyState
          title="No jobs available"
          description="Create a job to start building its recruitment pipeline."
          action={
            <Link to="/recruiter/jobs/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create a job
              </Button>
            </Link>
          }
        />
      ) : !selectedJobId ? (
        <EmptyState title="Select a job to view its recruitment pipeline." />
      ) : pipelineError ? (
        <ErrorState description={pipelineError} onRetry={refetchPipeline} />
      ) : (
        <>
          {selectedJob && (
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 shadow-card">
              <h2 className="text-sm font-semibold text-navy-900">{selectedJob.title}</h2>
              {pipelineLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-navy-500">
                  <span>
                    <strong className="text-navy-800">{applications.length}</strong> applications
                  </span>
                  <span>
                    <strong className="text-navy-800">{scheduledInterviewCount}</strong> interviews scheduled
                  </span>
                  <span>
                    <strong className="text-navy-800">{offerCount}</strong> offers
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mobile: stage tabs + single-column list */}
          <div className="sm:hidden">
            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
              {STAGES.map((stage) => (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => setMobileStage(stage.key)}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium",
                    mobileStage === stage.key
                      ? "bg-navy-900 text-white"
                      : "bg-surface-muted text-navy-600"
                  )}
                >
                  {stage.label} ({grouped.get(stage.key)?.length ?? 0})
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {pipelineLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : (grouped.get(mobileStage)?.length ?? 0) === 0 ? (
                <EmptyState title="No candidates in this stage." />
              ) : (
                grouped.get(mobileStage)!.map((app) => (
                  <PipelineCard
                    key={app.id}
                    application={app}
                    interview={interviewByApplicationId.get(app.id)}
                    offer={offerByApplicationId.get(app.id)}
                    allowedTransitions={APPLICATION_STATUS_TRANSITIONS[app.status]}
                    isUpdating={updatingIds.has(app.id)}
                    onOpen={() => setQuickViewApplicationId(app.id)}
                    onRequestMove={(toStatus) => requestMove(app, app.status, toStatus)}
                    onDragStart={() => undefined}
                    onDragEnd={() => undefined}
                    isDragging={false}
                  />
                ))
              )}
            </div>
          </div>

          {/* Desktop/tablet: horizontal Kanban */}
          <div className="hidden gap-3 overflow-x-auto pb-4 sm:flex">
            {STAGES.map((stage) => {
              const stageApps = grouped.get(stage.key) ?? [];
              return (
                <div
                  key={stage.key}
                  className={cn(
                    "flex w-64 shrink-0 flex-col rounded-md border border-t-4 border-surface-border bg-surface-muted",
                    STAGE_HEADER_CLASS[stage.key],
                    dragOverStage === stage.key && "ring-2 ring-accent-400"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStage(stage.key);
                  }}
                  onDragLeave={() => setDragOverStage((prev) => (prev === stage.key ? null : prev))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(stage.key);
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-navy-600">
                      {stage.label}
                    </span>
                    <span className="rounded-full bg-white px-1.5 py-0.5 text-xs font-medium text-navy-500">
                      {stageApps.length}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                    {pipelineLoading ? (
                      <>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </>
                    ) : stageApps.length === 0 ? (
                      <p className="px-1 py-3 text-center text-xs text-navy-400">No candidates here</p>
                    ) : (
                      stageApps.map((app) => (
                        <PipelineCard
                          key={app.id}
                          application={app}
                          interview={interviewByApplicationId.get(app.id)}
                          offer={offerByApplicationId.get(app.id)}
                          allowedTransitions={APPLICATION_STATUS_TRANSITIONS[app.status]}
                          isUpdating={updatingIds.has(app.id)}
                          onOpen={() => setQuickViewApplicationId(app.id)}
                          onRequestMove={(toStatus) => requestMove(app, app.status, toStatus)}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            setDragState({ applicationId: app.id, fromStatus: app.status });
                          }}
                          onDragEnd={() => {
                            setDragState(null);
                            setDragOverStage(null);
                          }}
                          isDragging={dragState?.applicationId === app.id}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {quickViewApp && selectedJob && (
        <CandidateQuickView
          applicationId={quickViewApp.id}
          job={selectedJob}
          interview={interviewByApplicationId.get(quickViewApp.id)}
          offer={offerByApplicationId.get(quickViewApp.id)}
          isOpen={quickViewApplicationId !== null}
          onClose={() => setQuickViewApplicationId(null)}
          onScheduleInterview={() => setScheduleModalApplicationId(quickViewApp.id)}
          onCreateOffer={() => setOfferModalApplicationId(quickViewApp.id)}
        />
      )}

      {scheduleModalApplicationId && (
        <ScheduleInterviewModal
          applicationId={scheduleModalApplicationId}
          isOpen={scheduleModalApplicationId !== null}
          onClose={() => setScheduleModalApplicationId(null)}
          onScheduled={() => showToast("Interview scheduled", "success")}
        />
      )}

      {offerModalApplicationId && (
        <CreateOfferModal
          applicationId={offerModalApplicationId}
          isOpen={offerModalApplicationId !== null}
          onClose={() => setOfferModalApplicationId(null)}
          onCreated={() => showToast("Offer created", "success")}
        />
      )}

      <Modal
        isOpen={pendingMove !== null}
        onClose={() => setPendingMove(null)}
        title="Reject application?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingMove(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingMove) void applyMove(pendingMove);
                setPendingMove(null);
              }}
            >
              Reject application
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          {pendingMove?.application.candidate.name} will be marked as rejected for this job. This
          status cannot be changed further once applied.
        </p>
      </Modal>
    </AppShell>
  );
}
