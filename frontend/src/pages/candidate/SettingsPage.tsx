import { LogOut } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { useAuth } from "../../context/AuthContext.js";

/**
 * Only "Account" (read-only, backed by /auth/me) and "Logout" are wired to
 * real functionality. Password change, notification preferences, and
 * privacy controls have no corresponding backend endpoints yet — rather
 * than fabricate an API, these sections are laid out and disabled so
 * they're a small step to wire up once the backend supports them.
 */
export function SettingsPage(): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <AppShell title="Settings">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Account" subtitle="Your basic account information." />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" value={user?.name ?? ""} disabled />
            <Input label="Email" value={user?.email ?? ""} disabled />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Password" subtitle="Change your account password." />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="New password" type="password" disabled placeholder="Coming soon" />
            <Input label="Confirm new password" type="password" disabled placeholder="Coming soon" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Notification preferences"
            subtitle="Choose which updates you receive."
          />
          <CardContent className="space-y-3">
            {["Application status changes", "Interview scheduling", "New messages"].map((label) => (
              <label
                key={label}
                className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2.5 opacity-60"
              >
                <span className="text-sm text-navy-700">{label}</span>
                <input type="checkbox" checked disabled className="h-4 w-4 rounded" />
              </label>
            ))}
            <p className="text-xs text-navy-400">
              Notification preference controls are coming in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Privacy" subtitle="Control who can see your profile." />
          <CardContent>
            <p className="text-sm text-navy-500">
              Privacy controls are coming in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Log out" subtitle="Sign out of your HireVora account on this device." />
          <CardContent>
            <Button variant="outline" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
