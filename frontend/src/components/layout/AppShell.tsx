import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { useAuth } from "../../context/AuthContext.js";

export interface AppShellProps {
  children: ReactNode;
  title?: string;
}

/**
 * Reusable application shell: dark navy sidebar + light content area + top
 * bar. Role-aware navigation is derived from the signed-in user, so
 * Candidate/Recruiter/Admin pages can all render inside the same shell.
 */
export function AppShell({ children, title }: AppShellProps): JSX.Element | null {
  const { user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        role={user.role}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
