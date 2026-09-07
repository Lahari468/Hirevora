import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn.js";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; direction: "up" | "down" };
  comparison?: string;
}

export function StatCard({ label, value, icon, trend, comparison }: StatCardProps): JSX.Element {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-50 text-accent-600">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold text-navy-900">{value}</p>
      {(trend || comparison) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                trend.direction === "up" ? "text-success-600" : "text-danger-600"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {comparison && <span className="text-navy-400">{comparison}</span>}
        </div>
      )}
    </div>
  );
}
