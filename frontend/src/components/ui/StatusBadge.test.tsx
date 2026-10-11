import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge.js";

/**
 * Regression coverage for the Phase 24 fix: APPLIED/SCREENING/SHORTLISTED/
 * INTERVIEW/OFFER previously fell through to a generic neutral-gray label
 * because only HIRED/REJECTED matched the real ApplicationStatus enum.
 */
describe("StatusBadge", () => {
  it.each([
    ["APPLIED", "Applied"],
    ["SCREENING", "Screening"],
    ["SHORTLISTED", "Shortlisted"],
    ["INTERVIEW", "Interview"],
    ["OFFER", "Offer"],
    ["HIRED", "Hired"],
    ["REJECTED", "Rejected"],
  ])("renders a real label for the actual ApplicationStatus value %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("falls back to a capitalized version of an unrecognized status rather than crashing", () => {
    render(<StatusBadge status="SOMETHING_NEW" />);
    expect(screen.getByText("Something_new")).toBeInTheDocument();
  });

  it("normalizes case and spaces before matching (e.g. lowercase from an API)", () => {
    render(<StatusBadge status="hired" />);
    expect(screen.getByText("Hired")).toBeInTheDocument();
  });
});
