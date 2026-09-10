import { cn } from "../../lib/cn.js";

export interface HireVoraLogoProps {
  /** "full" = mark + wordmark, "mark" = icon only, "compact" = smaller icon for tight spaces (mobile topbar). */
  variant?: "full" | "mark" | "compact";
  /** "color" for light backgrounds (navy + accent), "reversed" for dark surfaces (white + accent), "mono" for a single flat color (e.g. printed materials). */
  tone?: "color" | "reversed" | "mono";
  className?: string;
}

/**
 * HireLynk mark (v3): two solid rounded panels — one representing the
 * candidate, one the recruiter — offset so they overlap, with the overlap
 * itself picked out in the accent color as the "match" between them. No
 * letterform, no chain/handshake/spark/people pictogram: just two flat
 * shapes and where they meet, which is what keeps the mark legible at
 * favicon size and lets it degrade to two plain overlapping panels in
 * monochrome with no loss of meaning.
 */
function Mark({ size, tone }: { size: number; tone: "color" | "reversed" | "mono" }): JSX.Element {
  const panelColor = tone === "reversed" ? "#ffffff" : "#111729"; // white on dark / navy-900 on light
  const overlapColor = tone === "mono" ? panelColor : "#4f46e5"; // accent-600, or same as panels in mono mode
  const panelOpacity = tone === "mono" ? 0.85 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="HireVora"
    >
      {/* Panel A — candidate */}
      <rect x="5" y="5" width="20" height="20" rx="5" fill={panelColor} opacity={panelOpacity} />
      {/* Panel B — recruiter */}
      <rect x="15" y="15" width="20" height="20" rx="5" fill={panelColor} opacity={panelOpacity} />
      {/* The match: where the two overlap */}
      <rect x="16.5" y="16.5" width="7" height="7" rx="1.75" fill={overlapColor} />
    </svg>
  );
}

export function HireVoraLogo({
  variant = "full",
  tone = "color",
  className,
}: HireVoraLogoProps): JSX.Element {
  const size = variant === "compact" ? 24 : 32;
  const textColor = tone === "reversed" ? "text-white" : "text-navy-900";

  if (variant === "mark" || variant === "compact") {
    return (
      <span className={cn("inline-flex shrink-0", className)}>
        <Mark size={size} tone={tone} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark size={size} tone={tone} />
      <span className={cn("text-base font-semibold tracking-tight", textColor)}>HireVora</span>
    </span>
  );
}

export default HireVoraLogo;
