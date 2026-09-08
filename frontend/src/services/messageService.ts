import { apiUtils } from "./api.js";
import type {
  ConversationSummary,
  Message,
  PaginatedResult,
  SendMessagePayload,
} from "../types/index.js";

/** /api/messages/* */
export const messageService = {
  listConversations: (page = 1, limit = 20) =>
    apiUtils.get<PaginatedResult<ConversationSummary>>("/api/messages/conversations", {
      params: { page, limit },
    }),

  listMessages: (conversationId: string, page = 1, limit = 20) =>
    apiUtils.get<PaginatedResult<Message>>(
      `/api/messages/conversations/${conversationId}`,
      { params: { page, limit, sort: "oldest" } }
    ),

  send: (payload: SendMessagePayload) => apiUtils.post<Message>("/api/messages", payload),

  markRead: (conversationId: string) =>
    apiUtils.patch<null>(`/api/messages/conversations/${conversationId}/read`),
};
