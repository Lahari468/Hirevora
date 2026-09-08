import { apiUtils } from "./api.js";
import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from "../types/index.js";

/** /api/companies/* */
export const companyService = {
  getMine: () => apiUtils.get<Company>("/api/companies/me"),
  create: (payload: CreateCompanyPayload) => apiUtils.post<Company>("/api/companies", payload),
  update: (payload: UpdateCompanyPayload) => apiUtils.put<Company>("/api/companies/me", payload),
};
