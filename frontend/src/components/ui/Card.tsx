import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn.js";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-border bg-surface-card shadow-card",
        className
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-surface-border px-5 py-4",
        className
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn("p-5", className)} {...props} />;
}
