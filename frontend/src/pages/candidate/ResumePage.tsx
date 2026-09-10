import { useRef, useState, type ChangeEvent } from "react";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { useResumes } from "../../hooks/useResumes.js";
import { useToast } from "../../context/ToastContext.js";
import { formatDate, resolveFileUrl } from "../../lib/format.js";
import type { ApiResponse } from "../../types/index.js";

const ACCEPTED_TYPES = ".pdf,.doc,.docx";
const MAX_SIZE_MB = 5;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function ResumePage(): JSX.Element {
  const { resumes, isLoading, isUploading, error, refetch, upload, remove } = useResumes();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    try {
      await upload(file);
      showToast("Resume uploaded", "success");
    } catch (err) {
      setUploadError(isApiResponse(err) ? err.message : "Unable to upload resume.");
    }
  };

  const handleRemove = async (id: string): Promise<void> => {
    setRemovingId(id);
    try {
      await remove(id);
      showToast("Resume deleted", "info");
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to delete resume.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <AppShell title="Resume">
      <PageHeader
        title="Resume"
        description="Upload the resume(s) you'll use when applying to jobs."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
            <Button onClick={() => inputRef.current?.click()} isLoading={isUploading}>
              <Upload className="h-4 w-4" />
              Upload resume
            </Button>
          </>
        }
      />

      {uploadError && (
        <p role="alert" className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {uploadError}
        </p>
      )}

      <Card>
        <CardHeader
          title="Your resumes"
          subtitle="PDF or Word documents up to 5MB. You'll choose one of these when applying to a job."
        />
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : resumes.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-5 w-5" />}
              title="No resumes uploaded"
              description="Upload a resume to start applying to jobs on HireVora."
            />
          ) : (
            <ul className="divide-y divide-surface-border">
              {resumes.map((resume) => (
                <li key={resume.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-800">{resume.fileName}</p>
                    <p className="text-xs text-navy-500">Uploaded {formatDate(resume.createdAt)}</p>
                  </div>
                  <a
                    href={resolveFileUrl(resume.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Download ${resume.fileName}`}
                    className="focus-ring rounded-md p-2 text-navy-400 hover:bg-surface-muted hover:text-navy-600"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleRemove(resume.id)}
                    disabled={removingId === resume.id}
                    aria-label={`Delete ${resume.fileName}`}
                    className="focus-ring rounded-md p-2 text-navy-400 hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
