import { apiUtils } from "./api.js";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/index.js";

/**
 * Thin wrapper around the real `/api/auth/*` endpoints implemented in the
 * backend (see backend/src/routes/authRoutes.ts). No mock/fake responses —
 * every call here hits the live API.
 */
export const authService = {
  login: (payload: LoginPayload) => apiUtils.post<AuthResponse>("/api/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiUtils.post<AuthResponse>("/api/auth/register", payload),

  logout: () => apiUtils.post<null>("/api/auth/logout"),

  me: () => apiUtils.get<User>("/api/auth/me"),

  refresh: () => apiUtils.post<{ accessToken: string }>("/api/auth/refresh"),
};
