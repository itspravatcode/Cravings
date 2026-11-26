import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity, ActivityCategory, Id, Page } from '@/lib/types';
import { queryClient } from './queryClient';

export function useActivity(category: ActivityCategory) {
  return useInfiniteQuery({
    queryKey: ['activity', category],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get<Page<Activity>>('/activity', { category, page: pageParam, size: 20 }),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['activity', 'unread'],
    queryFn: () => api.get<{ count: number }>('/activity/unread-count'),
    select: (d) => d.count,
    refetchInterval: 60_000,
  });
}

export function useMarkRead() {
  return useMutation({
    mutationFn: (id: Id | 'all') => (id === 'all' ? api.post<void>('/activity/read-all') : api.post<void>(`/activity/${id}/read`)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activity'] }),
  });
}

const ACTIVITY_TEXT: Record<Activity['type'], string> = {
  GROUP_INVITE: 'invited you to join',
  GROUP_JOIN_REQUESTED: 'asked to join',
  GROUP_JOIN_APPROVED: 'approved your request to join',
  PLAN_CREATED: 'created a snack plan',
  PLAN_JOINED: 'joined your plan',
  PLAN_LEFT: 'left your plan',
  PLAN_UPDATED: 'updated a plan you joined',
  PLAN_CANCELLED: 'cancelled a plan you joined',
  POLL_CREATED: 'started a poll',
  POLL_CLOSING: 'A poll is closing soon. Cast your vote',
  POLL_CLOSED: 'A poll you voted in has closed',
  PICKUP_OFFER_CREATED: 'is heading out',
  PICKUP_REQUESTED: 'requested an item',
  PICKUP_REQUEST_ACCEPTED: 'accepted your request',
  PICKUP_REQUEST_DECLINED: 'declined your request',
  PICKUP_REQUEST_COMPLETED: 'picked up your item',
  PICKUP_REQUEST_CANCELLED: 'cancelled a pickup request',
  REPORT_SUBMITTED: 'Something in your group was reported. Tap to review',
};

/** "Alex joined your plan" or, for system events, just the text. */
export function describeActivity(a: Activity): { actor: string | null; text: string } {
  return { actor: a.actor?.name ?? null, text: ACTIVITY_TEXT[a.type] };
}
