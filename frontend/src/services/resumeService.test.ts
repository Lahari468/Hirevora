import { describe, it, expect } from "vitest";
import { resumeService } from "./resumeService.js";

/**
 * Phase 26 CRITICAL fix regression, frontend side: resumes are no longer
 * publicly reachable at a static /uploads path — the app must always
 * build authenticated API endpoint URLs (consumed by
 * lib/fileAccess.ts's openAuthenticatedFile, which attaches the
 * Authorization header) rather than a plain, unauthenticated file path.
 */
describe("resumeService — authenticated file URL construction (Phase 26 regression)", () => {
  it("ownFileUrl() points at the authenticated candidate endpoint, not a static /uploads path", () => {
    const url = resumeService.ownFileUrl("resume-123");

    expect(url).toBe("/api/candidates/me/resumes/resume-123/file");
    expect(url).not.toContain("/uploads");
  });

  it("recruiterFileUrl() points at the authenticated recruiter endpoint, not a static /uploads path", () => {
    const url = resumeService.recruiterFileUrl("resume-456");

    expect(url).toBe("/api/recruiters/resumes/resume-456/file");
    expect(url).not.toContain("/uploads");
  });

  it("both URL builders are scoped by the actual resume id, not a shared/fixed path", () => {
    expect(resumeService.ownFileUrl("a")).not.toBe(resumeService.ownFileUrl("b"));
    expect(resumeService.recruiterFileUrl("a")).not.toBe(resumeService.recruiterFileUrl("b"));
  });
});
