import { useState } from "react";
import { Modal } from "../ui/Modal.js";
import { Select } from "../ui/Select.js";
import { Input } from "../ui/Input.js";
import { Button } from "../ui/Button.js";
import { interviewService } from "../../services/interviewService.js";
import type { ApiResponse, InterviewType } from "../../types/index.js";

const TYPE_OPTIONS = [
  { value: "PHONE", label: "Phone" },
  { value: "VIDEO", label: "Video" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "HR", label: "HR" },
  { value: "ONSITE", label: "On-site" },
];

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export interface ScheduleInterviewModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export function ScheduleInterviewModal({
  applicationId,
  isOpen,
  onClose,
  onScheduled,
}: ScheduleInterviewModalProps): JSX.Element {
  const [interviewType, setInterviewType] = useState<InterviewType>("VIDEO");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    if (!scheduledAt) {
      setError("Choose a date and time.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await interviewService.create({
        applicationId,
        interviewType,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: duration ? Number(duration) : undefined,
        meetingLink: meetingLink || undefined,
      });
      if (res.success) {
        onScheduled();
        onClose();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(isApiResponse(err) ? err.message : "Unable to schedule interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule interview"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} isLoading={isSubmitting}>
            Schedule
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {error}
          </p>
        )}
        <Select
          label="Interview type"
          options={TYPE_OPTIONS}
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value as InterviewType)}
        />
        <Input
          label="Date and time"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          hint="Optional"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Input
          label="Meeting link"
          placeholder="https://..."
          hint="Optional"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />
      </div>
    </Modal>
  );
}
