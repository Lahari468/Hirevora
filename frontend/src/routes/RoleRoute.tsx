import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { ROLE_HOME_PATH } from "../navigation/navConfig.js";
import type { UserRole } from "../types/index.js";

export interface RoleRouteProps {
  allow: UserRole[];
}

/** Nested under ProtectedRoute: redirects a signed-in user away from routes their role can't access. */
export function RoleRoute({ allow }: RoleRouteProps): JSX.Element {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to={ROLE_HOME_PATH[user.role]} replace />;
  }

  return <Outlet />;
}
