import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { ProtectedRoute } from "./routes/ProtectedRoute.js";
import { RoleRoute } from "./routes/RoleRoute.js";
import { Home } from "./pages/Home.js";
import { Login } from "./pages/auth/Login.js";
import { Register } from "./pages/auth/Register.js";
import { ComingSoon } from "./pages/ComingSoon.js";
import { CandidateDashboard } from "./pages/candidate/CandidateDashboard.js";
import { RecruiterDashboard } from "./pages/recruiter/RecruiterDashboard.js";
import { AdminDashboard } from "./pages/admin/AdminDashboard.js";
import { NAV_BY_ROLE, SECONDARY_NAV_BY_ROLE } from "./navigation/navConfig.js";

function App(): JSX.Element {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected: any authenticated user */}
            <Route element={<ProtectedRoute />}>
              {/* Candidate namespace */}
              <Route element={<RoleRoute allow={["CANDIDATE"]} />}>
                <Route path="/candidate" element={<CandidateDashboard />} />
                {NAV_BY_ROLE.CANDIDATE.filter((item) => item.path !== "/candidate")
                  .concat(SECONDARY_NAV_BY_ROLE.CANDIDATE)
                  .map((item) => (
                    <Route
                      key={item.path}
                      path={item.path}
                      element={<ComingSoon title={item.label} />}
                    />
                  ))}
              </Route>

              {/* Recruiter namespace */}
              <Route element={<RoleRoute allow={["RECRUITER"]} />}>
                <Route path="/recruiter" element={<RecruiterDashboard />} />
                {NAV_BY_ROLE.RECRUITER.filter((item) => item.path !== "/recruiter")
                  .concat(SECONDARY_NAV_BY_ROLE.RECRUITER)
                  .map((item) => (
                    <Route
                      key={item.path}
                      path={item.path}
                      element={<ComingSoon title={item.label} />}
                    />
                  ))}
              </Route>

              {/* Admin namespace */}
              <Route element={<RoleRoute allow={["ADMIN"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                {NAV_BY_ROLE.ADMIN.filter((item) => item.path !== "/admin")
                  .concat(SECONDARY_NAV_BY_ROLE.ADMIN)
                  .map((item) => (
                    <Route
                      key={item.path}
                      path={item.path}
                      element={<ComingSoon title={item.label} />}
                    />
                  ))}
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
