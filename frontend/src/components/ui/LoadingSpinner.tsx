import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn.js";

const SIZE_CLASSES = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9" };

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  label?: string;
}): JSX.Element {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <Loader2 className={cn("animate-spin text-navy-400", SIZE_CLASSES[size])} />
    </span>
  );
}
