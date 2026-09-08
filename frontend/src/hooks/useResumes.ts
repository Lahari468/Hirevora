import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { resumeService } from "../services/resumeService.js";
import type { Resume } from "../types/index.js";

export function useResumes() {
  const [isUploading, setIsUploading] = useState(false);
  const fetcher = useCallback(() => resumeService.list(), []);
  const { data, isLoading, error, refetch } = useAsync<Resume[]>(fetcher, []);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const res = await resumeService.upload(file);
        refetch();
        return res.data ?? null;
      } finally {
        setIsUploading(false);
      }
    },
    [refetch]
  );

  const remove = useCallback(
    async (id: string) => {
      await resumeService.remove(id);
      refetch();
    },
    [refetch]
  );

  return { resumes: data ?? [], isLoading, isUploading, error, refetch, upload, remove };
}
