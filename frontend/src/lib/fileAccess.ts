import { apiClient } from "../services/api.js";
import type { ApiResponse } from "../types/index.js";

/**
 * Opens a file served from an authenticated backend endpoint (resumes are
 * no longer publicly reachable — see Phase 26 security fix). A plain
 * <a href> can't attach the Authorization header, so this fetches the file
 * as a blob through the authenticated axios client, then opens it via a
 * temporary object URL. The object URL is revoked shortly after opening;
 * it only needs to live long enough for the browser to load it into the
 * new tab.
 */
export async function openAuthenticatedFile(url: string): Promise<void> {
  try {
    const response = await apiClient.get(url, { responseType: "blob" });
    const blob = response as unknown as Blob;
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (err) {
    // A failed blob request still comes back as a Blob (of the JSON error
    // body) rather than a parsed ApiResponse, since axios respects
    // responseType for error responses too — read it back out as text so
    // the person sees the real backend message instead of "[object Blob]".
    if (err instanceof Blob) {
      const text = await err.text();
      try {
        const parsed = JSON.parse(text) as ApiResponse;
        throw new Error(parsed.message || "Unable to open file.");
      } catch {
        throw new Error("Unable to open file.");
      }
    }
    throw err;
  }
}
