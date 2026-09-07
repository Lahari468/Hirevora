import { cn } from "../../lib/cn.js";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export interface AvatarProps {
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-navy-100 font-semibold text-navy-700",
        SIZE_CLASSES[size],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
