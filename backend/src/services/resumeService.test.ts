import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mirrors the mocking pattern already established in
 * applicationService.transitions.test.ts: mock the Prisma module boundary,
 * exercise the REAL service functions. This is the service backing the
 * Phase 26 critical fix (public resume exposure) — these tests verify the
 * ownership checks that make the authenticated download endpoints actually
 * safe, not just present.
 */
vi.mock("../utils/prismaClient.js", () => ({
  prisma: {
    candidateProfile: { findUnique: vi.fn() },
    resume: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../utils/fileStorage.js", () => ({
  saveResumeFile: vi.fn(),
  deleteResumeFile: vi.fn(),
}));

import { prisma } from "../utils/prismaClient.js";
import {
  getCandidateResume,
  deleteResume,
  getRecruiterResumeAccess,
} from "./resumeService.js";
import { NotFoundError, ConflictError } from "../types/index.js";

const CANDIDATE_A_USER_ID = "candidate-a-user";
const CANDIDATE_A_PROFILE_ID = "candidate-a-profile";
const CANDIDATE_B_PROFILE_ID = "candidate-b-profile";
const RECRUITER_A = "recruiter-a";
const RECRUITER_B = "recruiter-b";

function mockFn<T extends (...args: never[]) => unknown>(fn: T) {
  return fn as unknown as ReturnType<typeof vi.fn>;
}

describe("resumeService.getCandidateResume — IDOR regression (CRITICAL)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the resume when it belongs to the requesting candidate", async () => {
    mockFn(prisma.candidateProfile.findUnique).mockResolvedValueOnce({
      id: CANDIDATE_A_PROFILE_ID,
    });
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-1",
      candidateId: CANDIDATE_A_PROFILE_ID,
      fileName: "resume.pdf",
      fileUrl: "/uploads/resumes/resume-1.pdf",
      createdAt: new Date(),
    });

    const result = await getCandidateResume("resume-1", CANDIDATE_A_USER_ID);
    expect(result.id).toBe("resume-1");
  });

  it("rejects access when the resume belongs to a different candidate (ID swap attack)", async () => {
    // Candidate A is authenticated, but the resume actually belongs to
    // Candidate B. Simply knowing/guessing the resume ID must not work.
    mockFn(prisma.candidateProfile.findUnique).mockResolvedValueOnce({
      id: CANDIDATE_A_PROFILE_ID,
    });
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-belongs-to-b",
      candidateId: CANDIDATE_B_PROFILE_ID,
      fileName: "resume.pdf",
      fileUrl: "/uploads/resumes/resume-belongs-to-b.pdf",
      createdAt: new Date(),
    });

    await expect(
      getCandidateResume("resume-belongs-to-b", CANDIDATE_A_USER_ID)
    ).rejects.toThrow(NotFoundError);
  });

  it("rejects a nonexistent resume id", async () => {
    mockFn(prisma.candidateProfile.findUnique).mockResolvedValueOnce({
      id: CANDIDATE_A_PROFILE_ID,
    });
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce(null);

    await expect(
      getCandidateResume("does-not-exist", CANDIDATE_A_USER_ID)
    ).rejects.toThrow(NotFoundError);
  });
});

describe("resumeService.deleteResume — ownership + business rule", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects deleting another candidate's resume", async () => {
    mockFn(prisma.candidateProfile.findUnique).mockResolvedValueOnce({
      id: CANDIDATE_A_PROFILE_ID,
    });
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-belongs-to-b",
      candidateId: CANDIDATE_B_PROFILE_ID,
      fileUrl: "/uploads/resumes/x.pdf",
      _count: { applications: 0 },
    });

    await expect(
      deleteResume("resume-belongs-to-b", CANDIDATE_A_USER_ID)
    ).rejects.toThrow(NotFoundError);
  });

  it("refuses to delete a resume that has already been used in an application", async () => {
    mockFn(prisma.candidateProfile.findUnique).mockResolvedValueOnce({
      id: CANDIDATE_A_PROFILE_ID,
    });
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-1",
      candidateId: CANDIDATE_A_PROFILE_ID,
      fileUrl: "/uploads/resumes/resume-1.pdf",
      _count: { applications: 2 },
    });

    await expect(deleteResume("resume-1", CANDIDATE_A_USER_ID)).rejects.toThrow(
      ConflictError
    );
  });
});

describe("resumeService.getRecruiterResumeAccess — cross-recruiter IDOR regression (CRITICAL)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("grants access when the recruiter owns the job the resume was used to apply to", async () => {
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-1",
      fileName: "resume.pdf",
      fileUrl: "/uploads/resumes/resume-1.pdf",
      createdAt: new Date(),
      applications: [{ job: { recruiterId: RECRUITER_A } }],
    });

    const result = await getRecruiterResumeAccess("resume-1", RECRUITER_A);
    expect(result.id).toBe("resume-1");
  });

  it("rejects a recruiter who has no application linking them to this resume (unrelated candidate)", async () => {
    // Recruiter B has no job that this candidate ever applied to with this
    // resume — they must not be able to fetch it just by guessing the ID.
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-1",
      fileName: "resume.pdf",
      fileUrl: "/uploads/resumes/resume-1.pdf",
      createdAt: new Date(),
      applications: [{ job: { recruiterId: RECRUITER_A } }],
    });

    await expect(
      getRecruiterResumeAccess("resume-1", RECRUITER_B)
    ).rejects.toThrow(NotFoundError);
  });

  it("rejects when the resume has never been used in any application", async () => {
    mockFn(prisma.resume.findUnique).mockResolvedValueOnce({
      id: "resume-1",
      fileName: "resume.pdf",
      fileUrl: "/uploads/resumes/resume-1.pdf",
      createdAt: new Date(),
      applications: [],
    });

    await expect(
      getRecruiterResumeAccess("resume-1", RECRUITER_A)
    ).rejects.toThrow(NotFoundError);
  });
});
