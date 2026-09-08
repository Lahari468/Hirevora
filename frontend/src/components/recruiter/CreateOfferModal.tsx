import { useState } from "react";
import { Modal } from "../ui/Modal.js";
import { Input } from "../ui/Input.js";
import { Textarea } from "../ui/Textarea.js";
import { Button } from "../ui/Button.js";
import { offerService } from "../../services/offerService.js";
import type { ApiResponse } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export interface CreateOfferModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOfferModal({
  applicationId,
  isOpen,
  onClose,
  onCreated,
}: CreateOfferModalProps): JSX.Element {
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await offerService.create({
        applicationId,
        salary: salary || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        notes: notes || undefined,
      });
      if (res.success) {
        onCreated();
        onClose();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(isApiResponse(err) ? err.message : "Unable to create offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create offer"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} isLoading={isSubmitting}>
            Send offer
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
        <Input
          label="Salary"
          placeholder="e.g. 90000"
          hint="Optional"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start date"
            type="date"
            hint="Optional"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Expiry date"
            type="date"
            hint="Optional"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <Textarea
          label="Notes"
          placeholder="Any additional terms or details"
          hint="Optional"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}
