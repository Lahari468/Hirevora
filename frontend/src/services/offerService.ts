import { apiUtils } from "./api.js";
import type {
  CreateOfferPayload,
  Offer,
  OfferStatus,
  PaginatedResult,
  UpdateOfferPayload,
} from "../types/index.js";

/** /api/offers/* — /mine and /:id are role-branched server-side (candidate vs recruiter) */
export const offerService = {
  listMine: (page = 1, limit = 10, status?: OfferStatus) =>
    apiUtils.get<PaginatedResult<Offer>>("/api/offers/mine", {
      params: { page, limit, status },
    }),

  getById: (id: string) => apiUtils.get<Offer>(`/api/offers/${id}`),

  accept: (id: string) => apiUtils.patch<Offer>(`/api/offers/${id}/accept`),

  reject: (id: string) => apiUtils.patch<Offer>(`/api/offers/${id}/reject`),

  // Recruiter-facing
  create: (payload: CreateOfferPayload) => apiUtils.post<Offer>("/api/offers", payload),

  update: (id: string, payload: UpdateOfferPayload) =>
    apiUtils.patch<Offer>(`/api/offers/${id}`, payload),

  withdraw: (id: string) => apiUtils.patch<Offer>(`/api/offers/${id}/withdraw`),
};
