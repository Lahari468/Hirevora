import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { messageService } from "../services/messageService.js";
import type { ConversationSummary, PaginatedResult } from "../types/index.js";

export function useConversations() {
  const fetcher = useCallback(() => messageService.listConversations(1, 50), []);
  return useAsync<PaginatedResult<ConversationSummary>>(fetcher, []);
}
