import type { ReactNode } from "react";

export interface ListCardRowProps {
  leading: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
}

/** A single row within a list-style dashboard card (candidates, messages, notifications). */
export function ListCardRow({ leading, primary, secondary, status, action }: ListCardRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 border-b border-surface-border px-5 py-3 last:border-0">
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy-800">{primary}</p>
        {secondary && <p className="truncate text-xs text-navy-500">{secondary}</p>}
      </div>
      {status}
      {action}
    </div>
  );
}
