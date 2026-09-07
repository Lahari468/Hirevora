import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  CalendarClock,
  MessageSquare,
  UserCircle,
  FileBadge,
  Bell,
  Settings,
  Briefcase,
  Users,
  BarChart3,
  Building2,
  HeartHandshake,
  Building,
  ShieldAlert,
  ClipboardList,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "../types/index.js";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

/**
 * Route architecture: each role owns a `/{role}/...` namespace. Only the
 * dashboard landing page is wired up in this phase — the rest of the paths
 * are established now so later phases can add pages without touching this
 * file's structure.
 */
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  CANDIDATE: [
    { label: "Dashboard", path: "/candidate", icon: LayoutDashboard },
    { label: "Find Jobs", path: "/candidate/jobs", icon: Search },
    { label: "Saved Jobs", path: "/candidate/saved-jobs", icon: Bookmark },
    { label: "Applications", path: "/candidate/applications", icon: FileText },
    { label: "Interviews", path: "/candidate/interviews", icon: CalendarClock },
    { label: "Messages", path: "/candidate/messages", icon: MessageSquare },
    { label: "Profile", path: "/candidate/profile", icon: UserCircle },
    { label: "Resume", path: "/candidate/resume", icon: FileBadge },
    { label: "Notifications", path: "/candidate/notifications", icon: Bell },
  ],
  RECRUITER: [
    { label: "Dashboard", path: "/recruiter", icon: LayoutDashboard },
    { label: "Jobs", path: "/recruiter/jobs", icon: Briefcase },
    { label: "Applications", path: "/recruiter/applications", icon: FileText },
    { label: "Candidates", path: "/recruiter/candidates", icon: Users },
    { label: "Interviews", path: "/recruiter/interviews", icon: CalendarClock },
    { label: "Messages", path: "/recruiter/messages", icon: MessageSquare },
    { label: "Offers", path: "/recruiter/offers", icon: HeartHandshake },
    { label: "Company", path: "/recruiter/company", icon: Building2 },
    { label: "Analytics", path: "/recruiter/analytics", icon: BarChart3 },
    { label: "Notifications", path: "/recruiter/notifications", icon: Bell },
  ],
  ADMIN: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Jobs", path: "/admin/jobs", icon: Briefcase },
    { label: "Companies", path: "/admin/companies", icon: Building },
    { label: "Applications", path: "/admin/applications", icon: FileText },
    { label: "Reports", path: "/admin/reports", icon: ClipboardList },
    { label: "Moderation", path: "/admin/moderation", icon: ShieldAlert },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: ScrollText },
  ],
};

export const SECONDARY_NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  CANDIDATE: [{ label: "Settings", path: "/candidate/settings", icon: Settings }],
  RECRUITER: [{ label: "Settings", path: "/recruiter/settings", icon: Settings }],
  ADMIN: [{ label: "Settings", path: "/admin/settings", icon: Settings }],
};

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  CANDIDATE: "/candidate",
  RECRUITER: "/recruiter",
  ADMIN: "/admin",
};
