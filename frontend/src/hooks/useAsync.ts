import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse } from "../types/index.js";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

/**
 * Runs `fetcher` whenever `deps` change, tracking loading/error/data state
 * and exposing a manual `refetch`. Every candidate page hook is built on
 * top of this so pages get consistent loading/empty/error handling without
 * duplicating the same try/catch boilerplate.
 */
export function useAsync<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: unknown[]
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetcherRef
      .current()
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setState({ data: res.data ?? null, isLoading: false, error: null });
        } else {
          setState({ data: null, isLoading: false, error: res.message });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = isApiResponse(err) ? err.message : "Something went wrong";
        setState({ data: null, isLoading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  return { ...state, refetch };
}
