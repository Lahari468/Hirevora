import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Mail, Phone, MapPin, Send } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { ScheduleInterviewModal } from "../../components/recruiter/ScheduleInterviewModal.js";
import { CreateOfferModal } from "../../components/recruiter/CreateOfferModal.js";
import { useRecruiterApplicationDetails } from "../../hooks/useRecruiterApplicationDetails.js";
import { useRecruiterApplicationsIndex } from "../../hooks/useRecruiterApplicationsIndex.js";
import { applicationService } from "../../services/applicationService.js";
import { messageService } from "../../services/messageService.js";
import { useToast } from "../../context/ToastContext.js";
import { formatDate, formatDateTime, resolveFileUrl } from "../../lib/format.js";
import type { ApiResponse, ApplicationStatus } from "../../types/index.js";
import { APPLICATION_STATUS_TRANSITIONS } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function ApplicationDetails(): JSX.Element {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { showToast } = useToast();
  const { data: application, isLoading, error, refetch } = useRecruiterApplicationDetails(applicationId);
  const { applications: indexedApplications } = useRecruiterApplicationsIndex();

  const [nextStatus, setNextStatus] = useState<ApplicationStatus | "">("");
  const [comment, setComment] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const jobContext = useMemo(
    () => indexedApplications.find((a) => a.id === applicationId)?.job,
    [indexedApplications, applicationId]
  );

  const allowedTransitions = application ? APPLICATION_STATUS_TRANSITIONS[application.status] : [];

  const handleUpdateStatus = async (): Promise<void> => {
    if (!applicationId || !nextStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await applicationService.updateStatus(applicationId, {
        status: nextStatus,
        comment: comment || undefined,
      });
      if (res.success) {
        showToast(`Status updated to ${nextStatus}`, "success");
        setNextStatus("");
        setComment("");
        refetch();
      } else {
        showToast(res.message, "error");
      }
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to update status.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!applicationId || !messageDraft.trim()) return;
    setIsSendingMessage(true);
    try {
      await messageService.send({ applicationId, content: messageDraft.trim() });
      showToast("Message sent", "success");
      setMessageDraft("");
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to send message.", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Application">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !application) {
    return (
      <AppShell title="Application">
        <ErrorState description={error ?? "This application could not be found."} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Application">
      <PageHeader
        title={application.candidate.name}
        breadcrumb={jobContext?.title ?? "Application"}
        actions={<StatusBadge status={application.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Candidate" />
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-navy-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-navy-400" />
                  {application.candidate.email}
                </span>
                {application.candidate.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-navy-400" />
                    {application.candidate.phone}
                  </span>
                )}
                {application.candidate.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-navy-400" />
                    {application.candidate.location}
                  </span>
                )}
              </div>
              {application.candidate.headline && (
                <p className="text-sm font-medium text-navy-800">{application.candidate.headline}</p>
              )}
              {application.candidate.bio && (
                <p className="whitespace-pre-line text-sm text-navy-600">{application.candidate.bio}</p>
              )}
              <div className="grid grid-cols-1 gap-2 text-sm text-navy-600 sm:grid-cols-2">
                {application.candidate.experienceYears !== null && (
                  <p>
                    <span className="text-navy-400">Experience:</span>{" "}
                    {application.candidate.experienceYears} yrs
                  </p>
                )}
                {application.candidate.education && (
                  <p>
                    <span className="text-navy-400">Education:</span> {application.candidate.education}
                  </p>
                )}
                {application.candidate.linkedinUrl && (
                  <a
                    href={application.candidate.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-600 hover:text-accent-700"
                  >
                    LinkedIn
                  </a>
                )}
                {application.candidate.githubUrl && (
                  <a
                    href={application.candidate.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-600 hover:text-accent-700"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {application.coverLetter && (
            <Card>
              <CardHeader title="Cover letter" />
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">
                  {application.coverLetter}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader title="Status history" />
            <CardContent>
              {!application.statusHistory || application.statusHistory.length === 0 ? (
                <p className="text-sm text-navy-500">No status changes yet.</p>
              ) : (
                <ul className="space-y-3">
                  {application.statusHistory.map((entry, idx) => (
                    <li key={idx} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-navy-800">
                          {entry.oldStatus ? `${entry.oldStatus} → ${entry.newStatus}` : entry.newStatus}
                        </p>
                        {entry.comment && <p className="text-xs text-navy-500">{entry.comment}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-navy-400">{formatDateTime(entry.changedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Message candidate" />
            <CardContent className="flex flex-col gap-3">
              <Textarea
                placeholder="Write a message to this candidate..."
                rows={3}
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => void handleSendMessage()}
                  isLoading={isSendingMessage}
                  disabled={!messageDraft.trim()}
                >
                  <Send className="h-4 w-4" />
                  Send message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Application info" />
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Job</span>
                <span className="text-navy-800">{jobContext?.title ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Location</span>
                <span className="text-navy-800">{jobContext?.location ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Applied</span>
                <span className="text-navy-800">{formatDate(application.appliedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Last updated</span>
                <span className="text-navy-800">{formatDate(application.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {application.resume && (
            <Card>
              <CardHeader title="Resume" />
              <CardContent>
                <a
                  href={resolveFileUrl(application.resume.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring flex items-center gap-2 rounded-md border border-surface-border p-3 text-sm text-navy-700 hover:bg-surface-muted"
                >
                  <FileText className="h-4 w-4 text-navy-400" />
                  {application.resume.fileName}
                </a>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader title="Update status" />
            <CardContent className="flex flex-col gap-3">
              {allowedTransitions.length === 0 ? (
                <p className="text-sm text-navy-500">
                  No further status changes are available for a {application.status.toLowerCase()} application.
                </p>
              ) : (
                <>
                  <Select
                    label="New status"
                    placeholder="Select a status"
                    options={allowedTransitions.map((s) => ({ value: s, label: s }))}
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as ApplicationStatus)}
                  />
                  <Textarea
                    label="Comment"
                    hint="Optional"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button onClick={() => void handleUpdateStatus()} isLoading={isUpdatingStatus} disabled={!nextStatus}>
                    Update status
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Actions" />
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setIsInterviewModalOpen(true)}>
                Schedule interview
              </Button>
              <Button variant="outline" onClick={() => setIsOfferModalOpen(true)}>
                Create offer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {applicationId && (
        <>
          <ScheduleInterviewModal
            applicationId={applicationId}
            isOpen={isInterviewModalOpen}
            onClose={() => setIsInterviewModalOpen(false)}
            onScheduled={() => showToast("Interview scheduled", "success")}
          />
          <CreateOfferModal
            applicationId={applicationId}
            isOpen={isOfferModalOpen}
            onClose={() => setIsOfferModalOpen(false)}
            onCreated={() => showToast("Offer created", "success")}
          />
        </>
      )}
    </AppShell>
  );
}
