import { Construction } from "lucide-react";
import { AppShell } from "../components/layout/AppShell.js";
import { PageHeader } from "../components/layout/PageHeader.js";
import { EmptyState } from "../components/ui/EmptyState.js";

/**
 * Placeholder used for nav destinations established in this phase but not
 * yet built out (e.g. Candidate > Interviews). Keeps every route in the
 * navigation architecture reachable without fabricating fake data.
 */
export function ComingSoon({ title }: { title: string }): JSX.Element {
  return (
    <AppShell title={title}>
      <PageHeader title={title} />
      <div className="rounded-lg border border-surface-border bg-surface-card shadow-card">
        <EmptyState
          icon={<Construction className="h-5 w-5" />}
          title="This page is coming in a later phase"
          description="The navigation and routing are in place — the full feature will be built out next."
        />
      </div>
    </AppShell>
  );
}
