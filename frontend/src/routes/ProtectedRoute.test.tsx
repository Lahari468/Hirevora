import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * Mocks only useAuth (the boundary this component depends on) and drives
 * the REAL ProtectedRoute component through react-router, verifying actual
 * redirect/render behavior for each of its three states — not just that it
 * "renders without crashing".
 */
const mockUseAuth = vi.fn();
vi.mock("../context/AuthContext.js", () => ({
  useAuth: () => mockUseAuth(),
}));

import { ProtectedRoute } from "./ProtectedRoute.js";

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/candidate/dashboard" element={<div>Candidate Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows a loading state instead of redirecting while auth status is unknown", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    renderAt("/candidate/dashboard");

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Candidate Dashboard")).not.toBeInTheDocument();
  });

  it("redirects to /login when the user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderAt("/candidate/dashboard");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Candidate Dashboard")).not.toBeInTheDocument();
  });

  it("renders the protected content when the user is authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    renderAt("/candidate/dashboard");

    expect(screen.getByText("Candidate Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
