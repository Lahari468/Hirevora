import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn.js";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-navy-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(
            "focus-ring w-full resize-y rounded-md border bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400",
            error ? "border-danger-500" : "border-surface-border",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-danger-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-navy-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
