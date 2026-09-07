import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn.js";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leadingIcon, trailingAdornment, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-navy-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-navy-400">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "focus-ring h-9 w-full rounded-md border bg-white px-3 text-sm text-navy-900 placeholder:text-navy-400",
              Boolean(leadingIcon) && "pl-9",
              Boolean(trailingAdornment) && "pr-9",
              error ? "border-danger-500" : "border-surface-border",
              className
            )}
            {...props}
          />
          {trailingAdornment && (
            <span className="absolute inset-y-0 right-3 flex items-center">{trailingAdornment}</span>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-navy-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
