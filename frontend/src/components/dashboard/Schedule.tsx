import { Clock } from "lucide-react";
import { EmptyState } from "../ui/EmptyState.js";

export interface ScheduleItem {
  id: string;
  title: string;
  subtitle?: string;
  time: string;
}

export interface ScheduleProps {
  items: ScheduleItem[];
  emptyMessage?: string;
}

/** Vertical list of upcoming timed events (interviews, deadlines). */
export function Schedule({ items, emptyMessage = "No upcoming events" }: ScheduleProps): JSX.Element {
  if (items.length === 0) {
    return <EmptyState icon={<Clock className="h-5 w-5" />} title={emptyMessage} />;
  }

  return (
    <ul className="divide-y divide-surface-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 px-5 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600">
            <Clock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-800">{item.title}</p>
            {item.subtitle && <p className="truncate text-xs text-navy-500">{item.subtitle}</p>}
          </div>
          <span className="shrink-0 text-xs font-medium text-navy-500">{item.time}</span>
        </li>
      ))}
    </ul>
  );
}
