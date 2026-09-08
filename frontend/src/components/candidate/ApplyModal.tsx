import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../ui/Modal.js";
import { Select } from "../ui/Select.js";
import { Textarea } from "../ui/Textarea.js";
import { Button } from "../ui/Button.js";
import { LoadingSpinner } from "../ui/LoadingSpinner.js";
import { useResumes } from "../../hooks/useResumes.js";
import { applicationService } from "../../services/applicationService.js";
import type { ApiResponse } from "../../types/index.js";

export interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
}

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function ApplyModal({ jobId, jobTitle, isOpen, onClose, onSuccess }: ApplyModalProps): JSX.Element {
  const { resumes, isLoading: isLoadingResumes } = useResumes();
  const [resumeId, setResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResumeId(resumes[0]?.id ?? "");
      setCoverLetter("");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resumes.length]);

  const coverLetterError =
    coverLetter.length > 0 && (coverLetter.length < 20 || coverLetter.length > 3000)
      ? "Cover letter must be between 20 and 3000 characters"
      : undefined;

  const handleSubmit = async (): Promise<void> => {
    setError(null);

    if (!resumeId) {
      setError("Select a resume to apply with.");
      return;
    }
    if (coverLetterError) {
      setError(coverLetterError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await applicationService.create({
        jobId,
        resumeId,
        coverLetter: coverLetter || undefined,
      });
      if (res.success && res.data) {
        onSuccess(res.data.id);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(isApiResponse(err) ? err.message : "Unable to submit your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to ${jobTitle}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            isLoading={isSubmitting}
            disabled={resumes.length === 0}
          >
            Submit application
          </Button>
        </>
      }
    >
      {isLoadingResumes ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      ) : resumes.length === 0 ? (
        <p className="text-sm text-navy-600">
          You need to upload a resume before applying.{" "}
          <Link to="/candidate/resume" className="font-medium text-accent-600 hover:text-accent-700">
            Upload one now
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
              {error}
            </p>
          )}
          <Select
            label="Resume"
            options={resumes.map((r) => ({ value: r.id, label: r.fileName }))}
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
          />
          <Textarea
            label="Cover letter (optional)"
            placeholder="Tell the recruiter why you're a great fit (20–3000 characters)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            error={coverLetterError}
            rows={5}
          />
        </div>
      )}
    </Modal>
  );
}
