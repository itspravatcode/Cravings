import { useInfiniteQuery, useMutation, useQuery, type InfiniteData } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { chatSocket, type ServerFrame } from '@/lib/chatSocket';
import { useSession } from '@/lib/session';
import type { ChatMessage, ChatUnread, Id, LocalMessage, MessagePage } from '@/lib/types';
import { queryClient } from './queryClient';

type Pages = InfiniteData<MessagePage, Id | null>;

const chatKey = (groupId: Id) => ['chat', groupId] as const;
const UNREAD_KEY = ['chat', 'unread'] as const;

/** The chat screen currently on screen, so incoming messages there count as read instead of unread. */
let openChat: Id | null = null;
export function setOpenChat(groupId: Id | null) {
  openChat = groupId;
}
export function getOpenChat() {
  return openChat;
}

function newClientId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Insert or replace a message in the cached history (newest first), matching by id or by our clientId. */
function upsert(groupId: Id, msg: LocalMessage) {
  queryClient.setQueryData<Pages>(chatKey(groupId), (data) => {
    if (!data) return data;
    const matches = (m: LocalMessage) => m.id === msg.id || (!!msg.clientId && m.clientId === msg.clientId);
    if (data.pages.some((p) => p.items.some(matches))) {
      return { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map((m) => (matches(m) ? msg : m)) })) };
    }
    const [first, ...rest] = data.pages;
    return { ...data, pages: [{ ...first, items: [msg, ...first.items] }, ...rest] };
  });
}

function markDeleted(groupId: Id, messageId: Id) {
  queryClient.setQueryData<Pages>(chatKey(groupId), (data) =>
    data && {
      ...data,
      pages: data.pages.map((p) => ({ ...p, items: p.items.map((m) => (m.id === messageId ? { ...m, deleted: true, body: null } : m)) })),
    });
}

function onFrame(frame: ServerFrame) {
  switch (frame.type) {
    case 'ready':
      // We may have missed messages while disconnected: refresh whatever is cached.
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
      break;
    case 'message': {
      const m = frame.message;
      upsert(m.groupId, m);
      const mine = m.sender?.id === useSession.getState().user?.id;
      if (m.groupId === openChat && !mine) void markRead(m.groupId, m.id);
      else if (!mine) void queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
      break;
    }
    case 'deleted':
      markDeleted(frame.groupId, frame.messageId);
      void queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
      break;
  }
}

/** Mount once inside the signed-in area: keeps the socket connected for the current session. */
export function useChatConnection() {
  const token = useSession((s) => s.token);
  useEffect(() => {
    if (!token) return;
    const unsubscribe = chatSocket.subscribe(onFrame);
    chatSocket.start(token);
    return () => {
      unsubscribe();
      chatSocket.stop();
      lastMarked = {};
    };
  }, [token]);
}

export function useMessages(groupId: Id) {
  return useInfiniteQuery({
    queryKey: chatKey(groupId),
    initialPageParam: null as Id | null,
    queryFn: ({ pageParam }) => api.get<MessagePage>(`/groups/${groupId}/messages`, { before: pageParam, limit: 30 }),
    getNextPageParam: (last) => (last.hasMore ? last.items[last.items.length - 1]?.id ?? null : null),
    // Pushed messages keep the cache fresh; don't refetch whole history on every focus.
    staleTime: Infinity,
  });
}

export function useChatUnread() {
  return useQuery({ queryKey: UNREAD_KEY, queryFn: () => api.get<ChatUnread>('/chats/unread'), refetchInterval: 120_000 });
}

let lastMarked: Record<Id, Id> = {};
export async function markRead(groupId: Id, messageId: Id) {
  if (messageId <= 0 || (lastMarked[groupId] ?? 0) >= messageId) return;
  lastMarked = { ...lastMarked, [groupId]: messageId };
  try {
    await api.post<void>(`/groups/${groupId}/messages/read`, { messageId });
  } finally {
    void queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
  }
}

export function useSendMessage(groupId: Id) {
  return useMutation({
    mutationFn: ({ body, clientId }: { body: string; clientId: string }) =>
      api.post<ChatMessage>(`/groups/${groupId}/messages`, { body, clientId }),
    onMutate: ({ body, clientId }) => {
      const me = useSession.getState().user;
      upsert(groupId, {
        id: -Date.now(), groupId, body, clientId, deleted: false, createdAt: new Date().toISOString(), pending: 'sending',
        sender: me && { id: me.id, name: me.name, username: me.username, avatarUrl: me.avatarUrl },
      });
    },
    onSuccess: (msg) => upsert(groupId, msg),
    onError: (_e, { body, clientId }) => {
      const failed = queryClient.getQueryData<Pages>(chatKey(groupId))?.pages.flatMap((p) => p.items).find((m) => m.clientId === clientId);
      if (failed) upsert(groupId, { ...failed, body, pending: 'failed' });
    },
  });
}

/** Send a new message, or resend a failed one with its original clientId (the server de-duplicates). */
export function useChatSender(groupId: Id) {
  const send = useSendMessage(groupId);
  return {
    send: (body: string) => send.mutate({ body, clientId: newClientId() }),
    retry: (m: LocalMessage) => m.body && m.clientId && send.mutate({ body: m.body, clientId: m.clientId }),
    error: send.error,
  };
}

export function useDeleteMessage(groupId: Id) {
  return useMutation({
    mutationFn: (messageId: Id) => api.delete<void>(`/messages/${messageId}`),
    onSuccess: (_r, messageId) => markDeleted(groupId, messageId),
  });
}

/** Remove a failed message the user gave up on. */
export function discardMessage(groupId: Id, clientId: string) {
  queryClient.setQueryData<Pages>(chatKey(groupId), (data) =>
    data && { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.filter((m) => m.clientId !== clientId || !m.pending) })) });
}
