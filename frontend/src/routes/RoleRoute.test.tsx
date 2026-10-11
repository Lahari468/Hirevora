import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * IDOR/BOLA-adjacent regression at the frontend layer: a signed-in
 * CANDIDATE must never see RECRUITER/ADMIN-only routes just by navigating
 * there directly, and vice versa. Mocks only useAuth; drives the REAL
 * RoleRoute + real ROLE_HOME_PATH redirect target.
 */
const mockUseAuth = vi.fn();
vi.mock("../context/AuthContext.js", () => ({
  useAuth: () => mockUseAuth(),
}));

import { RoleRoute } from "./RoleRoute.js";

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/candidate/dashboard" element={<div>Candidate Dashboard</div>} />
        <Route element={<RoleRoute allow={["ADMIN"]} />}>
          <Route path="/admin/users" element={<div>Admin Users</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("RoleRoute", () => {
  it("redirects to /login when there is no user at all", () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderAt("/admin/users");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("a CANDIDATE token cannot reach an ADMIN-only route — redirected to their own home instead", () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1", role: "CANDIDATE", name: "Jane", email: "j@x.com" } });
    renderAt("/admin/users");

    expect(screen.queryByText("Admin Users")).not.toBeInTheDocument();
    expect(screen.getByText("Candidate Dashboard")).toBeInTheDocument();
  });

  it("an ADMIN user can reach the ADMIN-only route", () => {
    mockUseAuth.mockReturnValue({ user: { id: "u2", role: "ADMIN", name: "Root", email: "a@x.com" } });
    renderAt("/admin/users");

    expect(screen.getByText("Admin Users")).toBeInTheDocument();
  });
});
