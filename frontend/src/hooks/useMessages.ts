import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { messageService } from "../services/messageService.js";
import type { Message, PaginatedResult } from "../types/index.js";

export function useMessages(conversationId: string | undefined) {
  const [isSending, setIsSending] = useState(false);

  const fetcher = useCallback(() => {
    if (!conversationId)
      return Promise.resolve({ success: false, message: "No conversation" } as const);
    return messageService.listMessages(conversationId, 1, 50);
  }, [conversationId]);

  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<Message>>(fetcher, [
    conversationId,
  ]);

  const send = useCallback(
    async (applicationId: string, content: string) => {
      setIsSending(true);
      try {
        await messageService.send({ applicationId, content });
        refetch();
      } finally {
        setIsSending(false);
      }
    },
    [refetch]
  );

  return { messages: data?.items ?? [], isLoading, isSending, error, refetch, send };
}
