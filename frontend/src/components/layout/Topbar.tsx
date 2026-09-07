import { Bell, Menu, Search, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { Avatar } from "../ui/Avatar.js";
import { Dropdown } from "../ui/Dropdown.js";
import { ROLE_HOME_PATH } from "../../navigation/navConfig.js";

interface TopbarProps {
  title?: string;
  onOpenMobileNav: () => void;
  showSearch?: boolean;
}

export function Topbar({ title, onOpenMobileNav, showSearch = true }: TopbarProps): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-surface-border bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="focus-ring rounded p-1.5 text-navy-500 hover:bg-surface-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {title && <h1 className="truncate text-base font-semibold text-navy-900">{title}</h1>}

      {showSearch && (
        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-navy-400" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="focus-ring h-9 w-full rounded-md border border-surface-border bg-surface-muted pl-9 pr-3 text-sm placeholder:text-navy-400"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="focus-ring relative rounded-md p-2 text-navy-500 hover:bg-surface-muted"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger-500" />
        </button>

        {user && (
          <Dropdown
            trigger={
              <span className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface-muted">
                <Avatar name={user.name} size="sm" />
                <span className="hidden text-sm font-medium text-navy-700 sm:inline">
                  {user.name}
                </span>
              </span>
            }
            items={[
              {
                label: "Settings",
                icon: <Settings className="h-4 w-4" />,
                onSelect: () => navigate(`${ROLE_HOME_PATH[user.role]}/settings`),
              },
              {
                label: "Logout",
                icon: <LogOut className="h-4 w-4" />,
                destructive: true,
                onSelect: () => void logout(),
              },
            ]}
          />
        )}
      </div>
    </header>
  );
}
