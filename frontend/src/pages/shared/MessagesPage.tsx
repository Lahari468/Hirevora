import { useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { cn } from "../../lib/cn.js";
import { formatRelativeTime, formatDateTime } from "../../lib/format.js";
import { useConversations } from "../../hooks/useConversations.js";
import { useMessages } from "../../hooks/useMessages.js";
import { useAuth } from "../../context/AuthContext.js";
import { messageService } from "../../services/messageService.js";

export function MessagesPage(): JSX.Element {
  const { user } = useAuth();
  const { data: conversationsData, isLoading, error, refetch } = useConversations();
  const conversations = conversationsData?.items ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const effectiveActiveId = activeConversation?.id;

  const { messages, isLoading: isLoadingMessages, isSending, send, refetch: refetchMessages } =
    useMessages(effectiveActiveId);

  const handleSelectConversation = (conversationId: string): void => {
    setActiveId(conversationId);
    void messageService.markRead(conversationId).then(() => refetch());
  };

  const handleSend = (e: FormEvent): void => {
    e.preventDefault();
    if (!draft.trim() || !activeConversation) return;
    void send(activeConversation.applicationId, draft.trim()).then(() => {
      setDraft("");
      refetchMessages();
    });
  };

  if (error) {
    return (
      <AppShell title="Messages">
        <ErrorState description={error} onRetry={refetch} />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell title="Messages">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (conversations.length === 0) {
    return (
      <AppShell title="Messages">
        <PageHeader title="Messages" />
        <EmptyState
          icon={<MessageSquare className="h-5 w-5" />}
          title="No conversations yet"
          description="Once a recruiter messages you about an application, it'll show up here."
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Messages">
      <PageHeader title="Messages" />
      <div className="flex h-[calc(100vh-11rem)] overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
        {/* Conversation list */}
        <div className="w-full max-w-xs shrink-0 overflow-y-auto border-r border-surface-border">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => handleSelectConversation(conv.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-surface-border p-4 text-left hover:bg-surface-muted",
                effectiveActiveId === conv.id && "bg-surface-muted"
              )}
            >
              <Avatar name={conv.otherParticipant?.name ?? "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-navy-800">
                    {conv.otherParticipant?.name ?? "Unknown"}
                  </p>
                  {conv.lastMessage && (
                    <span className="shrink-0 text-xs text-navy-400">
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-navy-500">{conv.jobTitle ?? "Application"}</p>
                <p className="mt-0.5 truncate text-xs text-navy-400">
                  {conv.lastMessage?.content ?? "No messages yet"}
                </p>
              </div>
              {conv.unreadCount > 0 && <Badge variant="accent">{conv.unreadCount}</Badge>}
            </button>
          ))}
        </div>

        {/* Active thread */}
        <div className="flex flex-1 flex-col">
          {activeConversation ? (
            <>
              <div className="border-b border-surface-border px-5 py-3">
                <p className="text-sm font-semibold text-navy-900">
                  {activeConversation.otherParticipant?.name ?? "Unknown"}
                </p>
                <p className="text-xs text-navy-500">{activeConversation.jobTitle ?? "Application"}</p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState title="No messages yet" description="Say hello to get the conversation started." />
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                            isMine ? "bg-navy-900 text-white" : "bg-surface-muted text-navy-800"
                          )}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-[11px]",
                              isMine ? "text-navy-300" : "text-navy-400"
                            )}
                          >
                            {formatDateTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-surface-border p-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  aria-label="Message"
                  className="focus-ring h-10 flex-1 rounded-md border border-surface-border bg-white px-3 text-sm placeholder:text-navy-400"
                />
                <button
                  type="submit"
                  disabled={isSending || !draft.trim()}
                  aria-label="Send message"
                  className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-navy-400">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
