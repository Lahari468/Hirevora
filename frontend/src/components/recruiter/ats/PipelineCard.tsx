import type { DragEvent } from "react";
import { CalendarClock, HeartHandshake, MoreVertical } from "lucide-react";
import { Avatar } from "../../ui/Avatar.js";
import { Dropdown } from "../../ui/Dropdown.js";
import { cn } from "../../../lib/cn.js";
import { formatDate } from "../../../lib/format.js";
import type { ApplicationStatus, Interview, JobApplicationListItem, Offer } from "../../../types/index.js";

export interface PipelineCardProps {
  application: JobApplicationListItem;
  interview?: Interview;
  offer?: Offer;
  allowedTransitions: ApplicationStatus[];
  isUpdating: boolean;
  onOpen: () => void;
  onRequestMove: (status: ApplicationStatus) => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function PipelineCard({
  application,
  interview,
  offer,
  allowedTransitions,
  isUpdating,
  onOpen,
  onRequestMove,
  onDragStart,
  onDragEnd,
  isDragging,
}: PipelineCardProps): JSX.Element {
  return (
    <div
      draggable={!isUpdating}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "focus-ring group cursor-grab rounded-md border border-surface-border bg-white p-3 shadow-xs transition-opacity active:cursor-grabbing",
        isDragging && "opacity-40",
        isUpdating && "pointer-events-none opacity-60"
      )}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Open ${application.candidate.name}'s application`}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={application.candidate.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-800">{application.candidate.name}</p>
          <p className="truncate text-xs text-navy-500">{application.candidate.email}</p>
        </div>
        {allowedTransitions.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <span className="focus-ring flex h-6 w-6 items-center justify-center rounded text-navy-400 hover:bg-surface-muted hover:text-navy-600">
                  <MoreVertical className="h-3.5 w-3.5" />
                </span>
              }
              items={allowedTransitions.map((status) => ({
                label: `Move to ${status}`,
                destructive: status === "REJECTED",
                onSelect: () => onRequestMove(status),
              }))}
            />
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-navy-400">Applied {formatDate(application.appliedAt)}</p>

      {(interview || offer) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {interview && interview.status === "SCHEDULED" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info-50 px-2 py-0.5 text-[11px] font-medium text-info-700">
              <CalendarClock className="h-3 w-3" />
              Interview scheduled
            </span>
          )}
          {offer && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
              <HeartHandshake className="h-3 w-3" />
              Offer {offer.status.toLowerCase()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
