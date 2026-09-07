import { cn } from "../../lib/cn.js";

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
}

export interface PipelineProps {
  stages: PipelineStage[];
  activeStageKey?: string;
}

/** Horizontal stage tracker for application/hiring pipelines (e.g. Applied -> Screening -> Interview -> Offer -> Hired). */
export function Pipeline({ stages, activeStageKey }: PipelineProps): JSX.Element {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto">
      {stages.map((stage) => {
        const isActive = stage.key === activeStageKey;
        return (
          <div
            key={stage.key}
            className={cn(
              "flex min-w-[120px] flex-1 flex-col gap-1 rounded-md border px-3 py-2.5",
              isActive
                ? "border-accent-200 bg-accent-50"
                : "border-surface-border bg-surface-muted"
            )}
          >
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                isActive ? "text-accent-700" : "text-navy-400"
              )}
            >
              {stage.label}
            </span>
            <span className={cn("text-lg font-semibold", isActive ? "text-accent-800" : "text-navy-800")}>
              {stage.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
