import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-navy-400">
        {icon ?? <Inbox className="h-5 w-5" />}
      </span>
      <div>
        <p className="text-sm font-semibold text-navy-800">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-navy-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
