import { Bookmark, BookmarkCheck, MapPin, Briefcase, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card.js";
import { Button } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";
import {
  formatDate,
  formatEmploymentType,
  formatExperienceRange,
  formatSalaryRange,
} from "../../lib/format.js";
import type { EmploymentType, JobCompany } from "../../types/index.js";

export interface JobCardData {
  id: string;
  title: string;
  location: string;
  employmentType: EmploymentType;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  company: JobCompany;
  createdAt?: string;
  savedAt?: string;
}

export interface JobCardProps {
  job: JobCardData;
  isSaved?: boolean;
  onToggleSave?: () => void;
  isSaving?: boolean;
}

export function JobCard({ job, isSaved, onToggleSave, isSaving }: JobCardProps): JSX.Element {
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);
  const experience = formatExperienceRange(job.experienceMin, job.experienceMax);

  return (
    <Card className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-dropdown">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/candidate/jobs/${job.id}`}
            className="focus-ring rounded text-base font-semibold text-navy-900 hover:text-accent-700"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 truncate text-sm text-navy-500">{job.company.name}</p>
        </div>
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            disabled={isSaving}
            aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
            className="focus-ring shrink-0 rounded-md p-1.5 text-navy-400 hover:bg-surface-muted hover:text-accent-600 disabled:opacity-50"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4.5 w-4.5 text-accent-600" />
            ) : (
              <Bookmark className="h-4.5 w-4.5" />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-navy-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          {formatEmploymentType(job.employmentType)}
        </span>
        {salary && (
          <span className="flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5" />
            {salary}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {experience && <Badge variant="neutral">{experience} experience</Badge>}
        {job.createdAt && (
          <span className="text-xs text-navy-400">Posted {formatDate(job.createdAt)}</span>
        )}
        {job.savedAt && (
          <span className="text-xs text-navy-400">Saved {formatDate(job.savedAt)}</span>
        )}
      </div>

      <div className="mt-1">
        <Link to={`/candidate/jobs/${job.id}`}>
          <Button variant="outline" size="sm">
            View job
          </Button>
        </Link>
      </div>
    </Card>
  );
}
