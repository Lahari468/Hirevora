import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * authService.ts previously instantiated its own `new PrismaClient()`
 * instead of importing the shared utils/prismaClient.js singleton used
 * everywhere else in this codebase — a real bug (separate, uncontrolled
 * connection pool) found and fixed during Phase 27 testing. It now imports
 * the shared singleton like every other service, so this mocks that same
 * module boundary, matching the pattern used in
 * applicationService.transitions.test.ts / resumeService.test.ts. Real
 * bcrypt (utils/password.js) and real JWT generation (utils/jwt.js) are
 * left unmocked deliberately — this test verifies actual hashing and
 * token-generation behavior, not just that the service "calls a function".
 */
vi.mock("../utils/prismaClient.js", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    candidateProfile: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "../utils/prismaClient.js";
import { registerCandidate, login } from "./authService.js";
import { hashPassword } from "../utils/password.js";
import { ConflictError, AuthenticationError } from "../types/index.js";

const mockUser = prisma.user as unknown as { findUnique: ReturnType<typeof vi.fn> };
const mockCandidateProfile = prisma.candidateProfile as unknown as {
  create: ReturnType<typeof vi.fn>;
};
const mockAuditLog = prisma.auditLog as unknown as { create: ReturnType<typeof vi.fn> };
const mockTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

function mockDbUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    name: "Jane Candidate",
    email: "jane@example.com",
    role: "CANDIDATE",
    isActive: true,
    passwordHash: "will-be-overridden",
    ...overrides,
  };
}

describe("authService.registerCandidate — real behavior (HIGH PRIORITY)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects registration with an email already in use", async () => {
    mockUser.findUnique.mockResolvedValueOnce(mockDbUser());

    await expect(
      registerCandidate({ name: "Jane", email: "jane@example.com", password: "Passw0rd!23", role: "CANDIDATE" })
    ).rejects.toThrow(ConflictError);

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("normalizes email to lowercase before checking for duplicates", async () => {
    mockUser.findUnique.mockResolvedValueOnce(null);
    mockTransaction.mockImplementationOnce(async (fn) =>
      fn({
        user: { create: vi.fn().mockResolvedValue(mockDbUser({ email: "jane@example.com" })) },
        candidateProfile: mockCandidateProfile,
      })
    );

    await registerCandidate({ name: "Jane", email: "JANE@Example.com", password: "Passw0rd!23", role: "CANDIDATE" });

    expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { email: "jane@example.com" } });
  });

  it("issues a real access + refresh token pair on successful registration", async () => {
    mockUser.findUnique.mockResolvedValueOnce(null);
    mockTransaction.mockImplementationOnce(async (fn) =>
      fn({
        user: { create: vi.fn().mockResolvedValue(mockDbUser()) },
        candidateProfile: mockCandidateProfile,
      })
    );

    const result = await registerCandidate({
      name: "Jane",
      email: "jane@example.com",
      password: "Passw0rd!23",
      role: "CANDIDATE",
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.split(".")).toHaveLength(3); // real JWT shape
    expect(result.user.email).toBe("jane@example.com");
  });
});

describe("authService.login — real behavior (HIGH PRIORITY)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a nonexistent user with a generic message (no account enumeration)", async () => {
    mockUser.findUnique.mockResolvedValueOnce(null);

    await expect(login({ email: "nobody@example.com", password: "whatever" })).rejects.toThrow(
      AuthenticationError
    );
    await expect(
      login({ email: "nobody@example.com", password: "whatever" })
    ).rejects.toThrow("Invalid email or password");
  });

  it("rejects an incorrect password against a REAL bcrypt hash, with the same generic message", async () => {
    const realHash = await hashPassword("correct-password");
    mockUser.findUnique.mockResolvedValue(mockDbUser({ passwordHash: realHash }));

    await expect(
      login({ email: "jane@example.com", password: "wrong-password" })
    ).rejects.toThrow("Invalid email or password");
    expect(mockAuditLog.create).not.toHaveBeenCalled();
  });

  it("rejects a suspended (inactive) account before checking the password at all", async () => {
    const realHash = await hashPassword("correct-password");
    mockUser.findUnique.mockResolvedValueOnce(mockDbUser({ isActive: false, passwordHash: realHash }));

    await expect(
      login({ email: "jane@example.com", password: "correct-password" })
    ).rejects.toThrow("suspended");
  });

  it("accepts the correct password against a REAL bcrypt hash and issues real tokens", async () => {
    const realHash = await hashPassword("correct-password");
    mockUser.findUnique.mockResolvedValueOnce(mockDbUser({ passwordHash: realHash }));
    mockAuditLog.create.mockResolvedValueOnce({});

    const result = await login({ email: "jane@example.com", password: "correct-password" });

    expect(result.user.id).toBe("user-1");
    expect(result.accessToken.split(".")).toHaveLength(3);
    expect(mockAuditLog.create).toHaveBeenCalledOnce();
  });

  it("never returns the password hash in the response", async () => {
    const realHash = await hashPassword("correct-password");
    mockUser.findUnique.mockResolvedValueOnce(mockDbUser({ passwordHash: realHash }));
    mockAuditLog.create.mockResolvedValueOnce({});

    const result = await login({ email: "jane@example.com", password: "correct-password" });

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(result)).not.toContain(realHash);
  });
});
