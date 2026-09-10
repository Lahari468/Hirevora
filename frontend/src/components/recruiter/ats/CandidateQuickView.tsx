import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Mail, MapPin, Send, ExternalLink } from "lucide-react";
import { Modal } from "../../ui/Modal.js";
import { Button } from "../../ui/Button.js";
import { Textarea } from "../../ui/Textarea.js";
import { LoadingSpinner } from "../../ui/LoadingSpinner.js";
import { StatusBadge } from "../../ui/StatusBadge.js";
import { useRecruiterApplicationDetails } from "../../../hooks/useRecruiterApplicationDetails.js";
import { messageService } from "../../../services/messageService.js";
import { useToast } from "../../../context/ToastContext.js";
import { formatDate, resolveFileUrl } from "../../../lib/format.js";
import type { ApiResponse, Interview, Job, Offer } from "../../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export interface CandidateQuickViewProps {
  applicationId: string;
  job: Job;
  interview?: Interview;
  offer?: Offer;
  isOpen: boolean;
  onClose: () => void;
  onScheduleInterview: () => void;
  onCreateOffer: () => void;
}

/**
 * Fetches the same real endpoint the full Application Details page uses
 * (useRecruiterApplicationDetails / GET /applications/:id/recruiter) rather
 * than a second, duplicated candidate-detail implementation — this modal is
 * just a compact renderer over that data, with a link out to the complete
 * page for anything not shown here.
 */
export function CandidateQuickView({
  applicationId,
  job,
  interview,
  offer,
  isOpen,
  onClose,
  onScheduleInterview,
  onCreateOffer,
}: CandidateQuickViewProps): JSX.Element {
  const { data: application, isLoading, error } = useRecruiterApplicationDetails(
    isOpen ? applicationId : undefined
  );
  const { showToast } = useToast();
  const [messageDraft, setMessageDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (): Promise<void> => {
    if (!messageDraft.trim()) return;
    setIsSending(true);
    try {
      await messageService.send({ applicationId, content: messageDraft.trim() });
      showToast("Message sent", "success");
      setMessageDraft("");
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to send message.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidate" size="lg">
      {isLoading || !application ? (
        <div className="flex h-40 items-center justify-center">
          {error ? <p className="text-sm text-danger-600">{error}</p> : <LoadingSpinner size="lg" />}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-navy-900">{application.candidate.name}</h3>
              {application.candidate.headline && (
                <p className="text-sm text-navy-600">{application.candidate.headline}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {application.candidate.email}
                </span>
                {application.candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {application.candidate.location}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md bg-surface-muted p-3 text-xs">
            <div>
              <p className="text-navy-400">Job</p>
              <p className="font-medium text-navy-800">{job.title}</p>
            </div>
            <div>
              <p className="text-navy-400">Applied</p>
              <p className="font-medium text-navy-800">{formatDate(application.appliedAt)}</p>
            </div>
            {interview && (
              <div>
                <p className="text-navy-400">Interview</p>
                <p className="font-medium text-navy-800">{interview.status}</p>
              </div>
            )}
            {offer && (
              <div>
                <p className="text-navy-400">Offer</p>
                <p className="font-medium text-navy-800">{offer.status}</p>
              </div>
            )}
          </div>

          {application.candidate.experienceYears !== null && (
            <p className="text-sm text-navy-600">
              <span className="text-navy-400">Experience:</span> {application.candidate.experienceYears} yrs
            </p>
          )}

          {application.resume && (
            <a
              href={resolveFileUrl(application.resume.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="focus-ring flex items-center gap-2 rounded-md border border-surface-border p-2.5 text-sm text-navy-700 hover:bg-surface-muted"
            >
              <FileText className="h-4 w-4 text-navy-400" />
              {application.resume.fileName}
            </a>
          )}

          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Send a quick message..."
              rows={2}
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onScheduleInterview}>
                  Schedule interview
                </Button>
                <Button variant="outline" size="sm" onClick={onCreateOffer}>
                  Create offer
                </Button>
                <Link to={`/recruiter/applications/${applicationId}`}>
                  <Button variant="ghost" size="sm">
                    Full application
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              <Button
                size="sm"
                onClick={() => void handleSendMessage()}
                isLoading={isSending}
                disabled={!messageDraft.trim()}
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
