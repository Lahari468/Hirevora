import { AlertTriangle } from "lucide-react";
import { Button } from "./Button.js";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-navy-800">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-navy-500">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
