import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Id, Report, ReportReason, ReportTarget, UserSummary } from '@/lib/types';
import { invalidateContent, queryClient } from './queryClient';

export type ReportInput = { targetType: ReportTarget; targetId: Id; groupId?: Id; reason: ReportReason; details?: string };

/** Blocking changes what's visible almost everywhere, so refresh broadly. */
const refreshAfterBlock = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['me', 'blocks'] }),
    queryClient.invalidateQueries({ queryKey: ['chat'] }),
    invalidateContent(),
  ]);

export function useBlocked() {
  return useQuery({ queryKey: ['me', 'blocks'], queryFn: () => api.get<UserSummary[]>('/me/blocks') });
}

export function useBlock() {
  return useMutation({
    mutationFn: ({ userId, block }: { userId: Id; block: boolean }) =>
      block ? api.post<void>(`/users/${userId}/block`) : api.delete<void>(`/users/${userId}/block`),
    onSuccess: refreshAfterBlock,
  });
}

export function useReport() {
  return useMutation({ mutationFn: (input: ReportInput) => api.post<Report>('/reports', input) });
}

export function useGroupReports(groupId: Id, enabled = true) {
  return useQuery({ queryKey: ['groups', groupId, 'reports'], queryFn: () => api.get<Report[]>(`/groups/${groupId}/reports`), enabled });
}

export function useResolveReport(groupId: Id) {
  return useMutation({
    mutationFn: ({ reportId, action }: { reportId: Id; action: 'REMOVE' | 'DISMISS' }) =>
      api.post<void>(`/reports/${reportId}/resolve`, { action }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
        queryClient.invalidateQueries({ queryKey: ['chat', groupId] }),
        invalidateContent(),
      ]),
  });
}
