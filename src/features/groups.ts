import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GroupDetail, GroupPreview, GroupSummary, GroupType, Id, JoinMode, JoinResult, MemberView } from '@/lib/types';
import { invalidateContent, queryClient } from './queryClient';

export type GroupInput = { name: string; type: GroupType; description?: string; joinMode?: JoinMode };

const refreshGroups = () => Promise.all([queryClient.invalidateQueries({ queryKey: ['groups'] }), invalidateContent()]);

export function useMyGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: () => api.get<GroupSummary[]>('/groups') });
}

/** Groups the user can post into (active memberships only). */
export function useActiveGroups() {
  const q = useMyGroups();
  return { ...q, data: q.data?.filter((g) => g.myStatus === 'ACTIVE') };
}

export function useGroup(id: Id) {
  return useQuery({ queryKey: ['groups', id], queryFn: () => api.get<GroupDetail>(`/groups/${id}`) });
}

export function useMembers(id: Id) {
  return useQuery({ queryKey: ['groups', id, 'members'], queryFn: () => api.get<MemberView[]>(`/groups/${id}/members`) });
}

export function useJoinRequests(id: Id, enabled: boolean) {
  return useQuery({
    queryKey: ['groups', id, 'join-requests'],
    queryFn: () => api.get<MemberView[]>(`/groups/${id}/join-requests`),
    enabled,
  });
}

export function useInvitePreview(code: string) {
  return useQuery({
    queryKey: ['invite', code],
    queryFn: () => api.get<GroupPreview>(`/groups/invite/${encodeURIComponent(code)}`),
    enabled: code.trim().length >= 6,
  });
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: (input: GroupInput) => api.post<GroupDetail>('/groups', input),
    onSuccess: refreshGroups,
  });
}

export function useUpdateGroup(id: Id) {
  return useMutation({
    mutationFn: (input: Partial<GroupInput>) => api.patch<GroupDetail>(`/groups/${id}`, input),
    onSuccess: refreshGroups,
  });
}

export function useJoinGroup() {
  return useMutation({
    mutationFn: (inviteCode: string) => api.post<JoinResult>('/groups/join', { inviteCode: inviteCode.trim() }),
    onSuccess: refreshGroups,
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (groupId: Id) => api.post<JoinResult>(`/groups/${groupId}/accept-invite`),
    onSuccess: refreshGroups,
  });
}

export function useInviteUser(groupId: Id) {
  return useMutation({
    mutationFn: (username: string) => api.post<void>(`/groups/${groupId}/invites`, { username: username.trim().replace(/^@/, '') }),
  });
}

export function useRegenerateCode(groupId: Id) {
  return useMutation({
    mutationFn: () => api.post<{ inviteCode: string }>(`/groups/${groupId}/invite-code`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useLeaveGroup() {
  return useMutation({ mutationFn: (groupId: Id) => api.post<void>(`/groups/${groupId}/leave`), onSuccess: refreshGroups });
}

export function useDeleteGroup() {
  return useMutation({ mutationFn: (groupId: Id) => api.delete<void>(`/groups/${groupId}`), onSuccess: refreshGroups });
}

export function useMemberAction(groupId: Id) {
  return useMutation({
    mutationFn: ({ action, userId }: { action: 'approve' | 'decline' | 'remove' | 'make-owner'; userId: Id }) => {
      switch (action) {
        case 'approve':
        case 'decline':
          return api.post<void>(`/groups/${groupId}/join-requests/${userId}/${action}`);
        case 'remove':
          return api.delete<void>(`/groups/${groupId}/members/${userId}`);
        case 'make-owner':
          return api.post<void>(`/groups/${groupId}/transfer-ownership`, { userId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}
