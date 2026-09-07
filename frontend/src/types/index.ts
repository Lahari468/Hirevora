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
  description?: string;
  website?: string;
  location?: string;
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

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
