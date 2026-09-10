export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

/**
 * Matches the shape actually returned by the backend (`prisma.User` +
 * authService responses): a single `name` field, no separate first/last
 * name. The previous version of this interface declared `firstName` /
 * `lastName`, which the API never sends — corrected here so consumers of
 * `/auth/me`, `/auth/login`, and `/auth/register` get real fields.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  createdAt?: string;
  updatedAt?: string;
  recruiterCount?: number;
  jobCount?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterCandidatePayload {
  name: string;
  email: string;
  password: string;
  role: "CANDIDATE";
}

export interface RegisterRecruiterPayload {
  name: string;
  email: string;
  password: string;
  role: "RECRUITER";
  company: {
    name: string;
    description?: string;
    website?: string;
    location?: string;
  };
}

export type RegisterPayload = RegisterCandidatePayload | RegisterRecruiterPayload;

export interface AuthResponse {
  user: User;
  company?: Company;
  accessToken: string;
}

/**
 * Every paginated list endpoint in the backend (jobs, applications, saved
 * jobs, interviews, offers, messages, notifications) returns this exact
 * `{ items, pagination: {...} }` shape — not `{items, total, page,
 * pageSize}` as this file previously assumed.
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* -------------------------------------------------------------------------- */
/* Candidate profile (/api/candidates/me)                                     */
/* -------------------------------------------------------------------------- */

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  experienceYears: number | null;
  education: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UpdateCandidateProfilePayload {
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  experienceYears?: number;
  education?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

/* -------------------------------------------------------------------------- */
/* Jobs (/api/jobs)                                                           */
/* -------------------------------------------------------------------------- */

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface JobCompany {
  id: string;
  name: string;
}

export interface JobRecruiter {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: EmploymentType;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: JobStatus;
  companyId: string;
  recruiterId: string;
  createdAt: string;
  company: JobCompany;
  recruiter: JobRecruiter;
}

export interface JobSearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  employmentType?: EmploymentType;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  sort?: "newest" | "oldest";
}

/* -------------------------------------------------------------------------- */
/* Saved jobs (/api/candidates/me/saved-jobs)                                 */
/* -------------------------------------------------------------------------- */

export interface SavedJob {
  id: string;
  jobId: string;
  title: string;
  description: string;
  location: string;
  employmentType: EmploymentType;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: JobStatus;
  company: JobCompany;
  recruiter: JobRecruiter;
  savedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Resumes (/api/candidates/me/resumes)                                      */
/* -------------------------------------------------------------------------- */

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Applications (/api/applications)                                          */
/* -------------------------------------------------------------------------- */

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export interface ApplicationJobInfo {
  id: string;
  title: string;
  location: string;
  employmentType: EmploymentType;
  company: JobCompany;
}

export interface ApplicationResumeInfo {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface ApplicationStatusHistoryItem {
  oldStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  comment: string | null;
  changedAt: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter: string | null;
  job?: ApplicationJobInfo;
  resume?: ApplicationResumeInfo;
  statusHistory?: ApplicationStatusHistoryItem[];
}

export interface CreateApplicationPayload {
  jobId: string;
  resumeId: string;
  coverLetter?: string;
}

export interface ApplicationListFilters {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  sort?: "newest" | "oldest";
}

/** Filters for the job-scoped recruiter application list (GET /recruiters/jobs/:jobId/applications). */
export interface RecruiterApplicationListFilters {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  search?: string;
  sort?: "newest" | "oldest";
}

/* -------------------------------------------------------------------------- */
/* Interviews (/api/interviews)                                              */
/* -------------------------------------------------------------------------- */

export type InterviewType = "PHONE" | "VIDEO" | "TECHNICAL" | "HR" | "ONSITE";
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

/**
 * The backend's own list/get response for an interview is a flat row with
 * only `applicationId` — no nested job/company. The Interviews page joins
 * this against the candidate's own applications (already fetched via
 * `/applications/mine`) to show job/company context, rather than the
 * backend fabricating a shape it doesn't have.
 */
export interface Interview {
  id: string;
  applicationId: string;
  scheduledBy: string;
  interviewType: InterviewType;
  scheduledAt: string;
  duration: number | null;
  meetingLink: string | null;
  status: InterviewStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewListFilters {
  page?: number;
  limit?: number;
  status?: InterviewStatus;
  sort?: "newest" | "oldest";
}

/* -------------------------------------------------------------------------- */
/* Offers (/api/offers)                                                      */
/* -------------------------------------------------------------------------- */

export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";

export interface Offer {
  id: string;
  applicationId: string;
  createdBy: string;
  salary: string | null;
  startDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  status: OfferStatus;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Messaging (/api/messages)                                                 */
/* -------------------------------------------------------------------------- */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
}

export interface ConversationSummary {
  id: string;
  applicationId: string;
  jobTitle: string | null;
  otherParticipant: ConversationParticipant | null;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  applicationId: string;
  content: string;
}

/* -------------------------------------------------------------------------- */
/* Notifications (/api/notifications)                                        */
/* -------------------------------------------------------------------------- */

export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_STATUS_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_CANCELLED"
  | "NEW_APPLICATION"
  | "OFFER_RECEIVED"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "OFFER_WITHDRAWN"
  | "MESSAGE_RECEIVED"
  | "FEEDBACK_RECEIVED"
  | "REPORT_STATUS_UPDATED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Recruiter profile (/api/recruiters/me)                                    */
/* -------------------------------------------------------------------------- */

export interface RecruiterProfile {
  id: string;
  userId: string;
  jobTitle: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  company?: {
    id: string;
    name: string;
    location: string | null;
  };
}

export interface UpdateRecruiterProfilePayload {
  jobTitle?: string;
}

/* -------------------------------------------------------------------------- */
/* Company (/api/companies)                                                  */
/* -------------------------------------------------------------------------- */

export interface CreateCompanyPayload {
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

/* -------------------------------------------------------------------------- */
/* Recruiter job management                                                  */
/* -------------------------------------------------------------------------- */

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  employmentType: EmploymentType;
  experienceRequired?: number;
  salaryMin?: number;
  salaryMax?: number;
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

export interface RecruiterJobListFilters {
  page?: number;
  limit?: number;
  status?: JobStatus;
  search?: string;
  sort?: "newest" | "oldest" | "salary_high" | "salary_low";
}

/* -------------------------------------------------------------------------- */
/* Recruiter application management                                          */
/* -------------------------------------------------------------------------- */

/**
 * The backend's recruiter application view (`GET /applications/:id/recruiter`)
 * returns candidate info but not job info — the endpoint is only reachable
 * from a job-scoped list, so job context is carried by the frontend rather
 * than invented on the backend's behalf.
 */
export interface RecruiterApplicationCandidate {
  id: string;
  name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  experienceYears: number | null;
  education: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
}

export interface RecruiterApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter: string | null;
  resume?: ApplicationResumeInfo;
  statusHistory?: ApplicationStatusHistoryItem[];
  candidate: RecruiterApplicationCandidate;
}

/** Lighter row shape returned by the job-scoped application list endpoints. */
export interface JobApplicationListItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  comment?: string;
}

/** Statuses each current status may legally transition to (mirrors the backend's validTransitions map). */
export const APPLICATION_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: [],
};

/* -------------------------------------------------------------------------- */
/* Recruiter dashboard (/api/recruiters/dashboard)                           */
/* -------------------------------------------------------------------------- */

export interface RecruiterDashboardStats {
  jobs: {
    total: number;
    draft: number;
    open: number;
    closed: number;
  };
  applications: {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
  };
  recentApplications: Array<{
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    updatedAt: string;
    job: { id: string; title: string } | null;
    candidate: { id: string; name: string; email: string };
  }>;
}

/* -------------------------------------------------------------------------- */
/* Recruiter interview management                                            */
/* -------------------------------------------------------------------------- */

export interface CreateInterviewPayload {
  applicationId: string;
  interviewType: InterviewType;
  scheduledAt: string;
  duration?: number;
  meetingLink?: string;
}

export type UpdateInterviewPayload = Partial<
  Pick<CreateInterviewPayload, "interviewType" | "scheduledAt" | "duration" | "meetingLink">
>;

export interface CompleteInterviewPayload {
  feedback: string;
}

/* -------------------------------------------------------------------------- */
/* Recruiter offer management                                                */
/* -------------------------------------------------------------------------- */

export interface CreateOfferPayload {
  applicationId: string;
  salary?: string | number;
  startDate?: string;
  expiryDate?: string;
  notes?: string;
}

export type UpdateOfferPayload = Partial<Omit<CreateOfferPayload, "applicationId">>;

/* -------------------------------------------------------------------------- */
/* Admin — dashboard, users, jobs, companies, audit logs                     */
/* GET /api/admin/dashboard is served by adminController.getDashboard        */
/* (adminRoutes is mounted before adminAnalyticsRoutes at the same "/admin"  */
/* base path, so the richer adminAnalyticsController.getAdminDashboard is    */
/* never actually reached — this DashboardStats shape is what's live).      */
/* -------------------------------------------------------------------------- */

export interface AdminDashboardStats {
  totalUsers: number;
  candidateCount: number;
  recruiterCount: number;
  adminCount: number;
  totalCompanies: number;
  totalJobs: number;
  openJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserDetails {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  candidateProfile: { id: string; headline: string | null; location: string | null } | null;
  recruiterProfile: {
    id: string;
    jobTitle: string | null;
    company: { id: string; name: string } | null;
  } | null;
}

export interface AdminUserListFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sort?: "newest" | "oldest" | "name";
}

export interface AdminJobListItem {
  id: string;
  title: string;
  company: JobCompany;
  recruiter: { id: string; name: string };
  location: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: string;
}

export interface AdminJobDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: EmploymentType;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  company: Company;
  recruiter: { id: string; name: string; email: string };
  _count: { applications: number; skills: number };
}

export interface AdminJobListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  employmentType?: EmploymentType;
  sort?: "newest" | "oldest" | "salary_high" | "salary_low";
}

export interface AdminCompanyListItem {
  id: string;
  name: string;
  location: string | null;
  createdAt: string;
}

export interface AdminCompanyListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export type AuditAction =
  | "LOGIN"
  | "JOB_CREATED"
  | "JOB_UPDATED"
  | "JOB_PUBLISHED"
  | "APPLICATION_CREATED"
  | "APPLICATION_STATUS_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "USER_SUSPENDED"
  | "REPORT_CREATED"
  | "REPORT_REVIEWED"
  | "REPORT_RESOLVED"
  | "REPORT_DISMISSED";

export interface AdminAuditLogItem {
  id: string;
  user: { id: string; name: string } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

export interface AdminAuditLogListFilters {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  sort?: "newest" | "oldest";
}

/* -------------------------------------------------------------------------- */
/* Admin — reports / moderation                                              */
/* -------------------------------------------------------------------------- */

export type ReportTargetType = "JOB" | "USER" | "APPLICATION" | "MESSAGE" | "FEEDBACK";
export type ReportReason =
  | "SPAM"
  | "FRAUD"
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_JOB"
  | "MISLEADING_INFORMATION"
  | "OTHER";
export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";

/**
 * Flat shape as actually returned by the backend — reporterId/targetId are
 * raw UUIDs with no joined name/title. The Report Details page links out to
 * /admin/users/:id or /admin/jobs/:id (the only two target types with a
 * real admin detail endpoint) rather than inventing resolved names.
 */
export interface AdminReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolvedBy: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReportListFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
  sort?: "newest" | "oldest";
}

/** Mirrors backend/src/services/reportService.ts ALLOWED_TRANSITIONS exactly. */
export const REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  PENDING: ["REVIEWING", "RESOLVED", "DISMISSED"],
  REVIEWING: ["RESOLVED", "DISMISSED"],
  RESOLVED: [],
  DISMISSED: [],
};

export interface UpdateReportPayload {
  status: Extract<ReportStatus, "REVIEWING" | "RESOLVED" | "DISMISSED">;
  resolutionNote?: string;
}
