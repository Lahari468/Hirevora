import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";

/**
 * Regression test for the Phase 26 CRITICAL fix: resumes used to be served
 * from an unauthenticated static route (app.use("/uploads", express.static(...))).
 * That route was removed entirely in favor of the authenticated
 * GET /api/candidates/me/resumes/:id/file and GET /api/recruiters/resumes/:id/file
 * endpoints. This builds the REAL app (via the real createApp()/routes
 * wiring) and asserts the old public path is gone for good, rather than
 * just trusting that no one re-adds it later.
 *
 * routes/index.ts pulls in every controller -> service -> utils/prismaClient.js,
 * which would otherwise construct a real PrismaClient and attempt to load
 * its native query engine (unavailable in this sandbox — see Phase 27
 * report). Nothing in this test needs a database: a request to a path with
 * no matching route/static handler never reaches any controller.
 */
vi.mock("./utils/prismaClient.js", () => ({ prisma: {} }));

describe("app — public /uploads exposure regression (CRITICAL)", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const { createApp } = await import("./app.js");
    app = createApp();
  });

  it("no longer serves files from /uploads (old public resume path)", async () => {
    const res = await request(app).get("/uploads/resumes/anything.pdf");
    expect(res.status).not.toBe(200);
    expect(res.status).toBe(404);
  });

  it("does not serve arbitrary paths under /uploads either", async () => {
    const res = await request(app).get("/uploads/whatever-else.txt");
    expect(res.status).toBe(404);
  });

  it("the health endpoint still works (sanity check that the app itself is wired correctly)", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });
});
