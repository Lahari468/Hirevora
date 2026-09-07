/**
 * Lightweight classnames combiner. Filters out falsy values so components
 * can compose conditional Tailwind classes without extra dependencies.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
