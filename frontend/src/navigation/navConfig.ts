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
  Building2,
  HeartHandshake,
  Building,
  ShieldAlert,
  ScrollText,
  Kanban,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "../types/index.js";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  /** Optional group heading shown above the items (e.g. "MAIN", "PROFILE"). */
  label?: string;
  items: NavItem[];
}

/**
 * Route architecture: each role owns a `/{role}/...` namespace. Candidate
 * and Recruiter are fully built out; Admin remains foundation-only (its
 * real pages come in a later phase).
 */
export const NAV_BY_ROLE: Record<UserRole, NavSection[]> = {
  CANDIDATE: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", path: "/candidate/dashboard", icon: LayoutDashboard },
        { label: "Find Jobs", path: "/candidate/jobs", icon: Search },
        { label: "Saved Jobs", path: "/candidate/saved-jobs", icon: Bookmark },
        { label: "Applications", path: "/candidate/applications", icon: FileText },
        { label: "Interviews", path: "/candidate/interviews", icon: CalendarClock },
        { label: "Messages", path: "/candidate/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Profile",
      items: [
        { label: "My Profile", path: "/candidate/profile", icon: UserCircle },
        { label: "Resume", path: "/candidate/resume", icon: FileBadge },
      ],
    },
    {
      label: "Other",
      items: [
        { label: "Notifications", path: "/candidate/notifications", icon: Bell },
        { label: "Analytics", path: "/candidate/analytics", icon: BarChart3 },
      ],
    },
  ],
  RECRUITER: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", path: "/recruiter/dashboard", icon: LayoutDashboard },
        { label: "Jobs", path: "/recruiter/jobs", icon: Briefcase },
        { label: "Applications", path: "/recruiter/applications", icon: FileText },
        { label: "ATS Pipeline", path: "/recruiter/ats", icon: Kanban },
        { label: "Candidates", path: "/recruiter/candidates", icon: Users },
        { label: "Interviews", path: "/recruiter/interviews", icon: CalendarClock },
        { label: "Messages", path: "/recruiter/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Recruitment",
      items: [
        { label: "Offers", path: "/recruiter/offers", icon: HeartHandshake },
        { label: "Analytics", path: "/recruiter/analytics", icon: BarChart3 },
        { label: "Company", path: "/recruiter/company", icon: Building2 },
      ],
    },
    {
      label: "Other",
      items: [
        { label: "Notifications", path: "/recruiter/notifications", icon: Bell },
        { label: "Profile", path: "/recruiter/profile", icon: UserCircle },
      ],
    },
  ],
  ADMIN: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Management",
      items: [
        { label: "Users", path: "/admin/users", icon: Users },
        { label: "Companies", path: "/admin/companies", icon: Building },
        { label: "Jobs", path: "/admin/jobs", icon: Briefcase },
        { label: "Applications", path: "/admin/applications", icon: FileText },
      ],
    },
    {
      label: "Moderation",
      items: [{ label: "Reports", path: "/admin/reports", icon: ShieldAlert }],
    },
    {
      label: "System",
      items: [
        { label: "Audit Logs", path: "/admin/audit-logs", icon: ScrollText },
        { label: "Notifications", path: "/admin/notifications", icon: Bell },
      ],
    },
  ],
};

export const SECONDARY_NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  CANDIDATE: [{ label: "Settings", path: "/candidate/settings", icon: Settings }],
  RECRUITER: [{ label: "Settings", path: "/recruiter/settings", icon: Settings }],
  ADMIN: [{ label: "Settings", path: "/admin/settings", icon: Settings }],
};

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  CANDIDATE: "/candidate/dashboard",
  RECRUITER: "/recruiter/dashboard",
  ADMIN: "/admin/dashboard",
};

/** Flat item list per role — used where sections don't matter (e.g. generating "coming soon" routes). */
export const flatNavItems = (role: UserRole): NavItem[] =>
  NAV_BY_ROLE[role].flatMap((section) => section.items);
