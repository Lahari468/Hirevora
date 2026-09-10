import { NavLink } from "react-router-dom";
import { LogOut, X, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn.js";
import { NAV_BY_ROLE, SECONDARY_NAV_BY_ROLE } from "../../navigation/navConfig.js";
import type { UserRole } from "../../types/index.js";
import { useAuth } from "../../context/AuthContext.js";
import HireVoraLogo from "../brand/HireLynkLogo.js";

interface SidebarProps {
  role: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

function NavLinkItem({
  path,
  label,
  Icon,
  onClick,
}: {
  path: string;
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
}): JSX.Element {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "focus-ring flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-navy-300 hover:bg-white/5 hover:text-white"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function Sidebar({ role, isMobileOpen, onCloseMobile }: SidebarProps): JSX.Element {
  const { logout } = useAuth();
  const sections = NAV_BY_ROLE[role];
  const secondaryItems = SECONDARY_NAV_BY_ROLE[role];

  const content = (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <div className="flex items-center justify-between px-4 py-4">
        <HireVoraLogo variant="full" tone="reversed" />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="focus-ring rounded p-1 text-navy-300 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {sections.map((section, idx) => (
          <div key={section.label ?? idx} className="space-y-1">
            {section.label && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLinkItem
                key={item.path}
                path={item.path}
                label={item.label}
                Icon={item.icon}
                onClick={onCloseMobile}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        {secondaryItems.map((item) => (
          <NavLinkItem
            key={item.path}
            path={item.path}
            label={item.label}
            Icon={item.icon}
            onClick={onCloseMobile}
          />
        ))}
        <button
          type="button"
          onClick={() => void logout()}
          className="focus-ring flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="animate-slide-up absolute inset-y-0 left-0 w-64">{content}</aside>
        </div>
      )}
    </>
  );
}
