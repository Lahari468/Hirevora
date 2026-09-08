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
  ClipboardList,
  BarChart3,
  ScrollText,
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
      items: [{ label: "Notifications", path: "/candidate/notifications", icon: Bell }],
    },
  ],
  RECRUITER: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", path: "/recruiter/dashboard", icon: LayoutDashboard },
        { label: "Jobs", path: "/recruiter/jobs", icon: Briefcase },
        { label: "Applications", path: "/recruiter/applications", icon: FileText },
        { label: "Candidates", path: "/recruiter/candidates", icon: Users },
        { label: "Interviews", path: "/recruiter/interviews", icon: CalendarClock },
        { label: "Messages", path: "/recruiter/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Recruitment",
      items: [
        { label: "Offers", path: "/recruiter/offers", icon: HeartHandshake },
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
      items: [
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
  ADMIN: "/admin",
};

/** Flat item list per role — used where sections don't matter (e.g. generating "coming soon" routes). */
export const flatNavItems = (role: UserRole): NavItem[] =>
  NAV_BY_ROLE[role].flatMap((section) => section.items);
