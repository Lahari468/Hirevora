import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { ProtectedRoute } from "./routes/ProtectedRoute.js";
import { RoleRoute } from "./routes/RoleRoute.js";
import { Home } from "./pages/Home.js";
import { Login } from "./pages/auth/Login.js";
import { Register } from "./pages/auth/Register.js";
import { ComingSoon } from "./pages/ComingSoon.js";
import { AdminDashboard } from "./pages/admin/AdminDashboard.js";

// Shared (role-agnostic) pages
import { MessagesPage } from "./pages/shared/MessagesPage.js";
import { NotificationsPage } from "./pages/shared/NotificationsPage.js";

// Candidate pages
import { CandidateDashboard } from "./pages/candidate/CandidateDashboard.js";
import { FindJobs } from "./pages/candidate/FindJobs.js";
import { JobDetails as CandidateJobDetails } from "./pages/candidate/JobDetails.js";
import { SavedJobs } from "./pages/candidate/SavedJobs.js";
import { Applications as CandidateApplications } from "./pages/candidate/Applications.js";
import { ApplicationDetails as CandidateApplicationDetails } from "./pages/candidate/ApplicationDetails.js";
import { Interviews as CandidateInterviews } from "./pages/candidate/Interviews.js";
import { CandidateProfilePage } from "./pages/candidate/CandidateProfilePage.js";
import { ResumePage } from "./pages/candidate/ResumePage.js";
import { SettingsPage as CandidateSettingsPage } from "./pages/candidate/SettingsPage.js";

// Recruiter pages
import { RecruiterDashboard } from "./pages/recruiter/RecruiterDashboard.js";
import { JobsList } from "./pages/recruiter/JobsList.js";
import { CreateJob } from "./pages/recruiter/CreateJob.js";
import { EditJob } from "./pages/recruiter/EditJob.js";
import { JobDetails as RecruiterJobDetails } from "./pages/recruiter/JobDetails.js";
import { Applications as RecruiterApplications } from "./pages/recruiter/Applications.js";
import { ApplicationDetails as RecruiterApplicationDetails } from "./pages/recruiter/ApplicationDetails.js";
import { Candidates } from "./pages/recruiter/Candidates.js";
import { Interviews as RecruiterInterviews } from "./pages/recruiter/Interviews.js";
import { Offers } from "./pages/recruiter/Offers.js";
import { CompanyPage } from "./pages/recruiter/CompanyPage.js";
import { RecruiterProfilePage } from "./pages/recruiter/RecruiterProfilePage.js";
import { RecruiterSettingsPage } from "./pages/recruiter/RecruiterSettingsPage.js";

import { flatNavItems, SECONDARY_NAV_BY_ROLE } from "./navigation/navConfig.js";

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
              {/* Candidate namespace — fully built out (Phase 21) */}
              <Route element={<RoleRoute allow={["CANDIDATE"]} />}>
                <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/jobs" element={<FindJobs />} />
                <Route path="/candidate/jobs/:jobId" element={<CandidateJobDetails />} />
                <Route path="/candidate/saved-jobs" element={<SavedJobs />} />
                <Route path="/candidate/applications" element={<CandidateApplications />} />
                <Route path="/candidate/applications/:applicationId" element={<CandidateApplicationDetails />} />
                <Route path="/candidate/interviews" element={<CandidateInterviews />} />
                <Route path="/candidate/messages" element={<MessagesPage />} />
                <Route path="/candidate/profile" element={<CandidateProfilePage />} />
                <Route path="/candidate/resume" element={<ResumePage />} />
                <Route path="/candidate/notifications" element={<NotificationsPage />} />
                <Route path="/candidate/settings" element={<CandidateSettingsPage />} />
              </Route>

              {/* Recruiter namespace — fully built out (Phase 22) */}
              <Route element={<RoleRoute allow={["RECRUITER"]} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/jobs" element={<JobsList />} />
                <Route path="/recruiter/jobs/new" element={<CreateJob />} />
                <Route path="/recruiter/jobs/:jobId" element={<RecruiterJobDetails />} />
                <Route path="/recruiter/jobs/:jobId/edit" element={<EditJob />} />
                <Route path="/recruiter/applications" element={<RecruiterApplications />} />
                <Route path="/recruiter/applications/:applicationId" element={<RecruiterApplicationDetails />} />
                <Route path="/recruiter/candidates" element={<Candidates />} />
                <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
                <Route path="/recruiter/offers" element={<Offers />} />
                <Route path="/recruiter/messages" element={<MessagesPage />} />
                <Route path="/recruiter/company" element={<CompanyPage />} />
                <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
                <Route path="/recruiter/notifications" element={<NotificationsPage />} />
                <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
              </Route>

              {/* Admin namespace — foundation only; real pages come in a later phase */}
              <Route element={<RoleRoute allow={["ADMIN"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                {flatNavItems("ADMIN")
                  .filter((item) => item.path !== "/admin")
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
