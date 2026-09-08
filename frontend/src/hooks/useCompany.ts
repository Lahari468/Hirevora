import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { companyService } from "../services/companyService.js";
import type { Company } from "../types/index.js";

export function useCompany() {
  const fetcher = useCallback(() => companyService.getMine(), []);
  return useAsync<Company>(fetcher, []);
}
