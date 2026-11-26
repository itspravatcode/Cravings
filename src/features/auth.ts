import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { unregisterPush } from '@/lib/push';
import { useSession } from '@/lib/session';
import type { AuthResponse, Me, Page, Plan, Poll, PickupOffer, PickupRequest, ProfileStats } from '@/lib/types';
import { queryClient } from './queryClient';

export type RegisterInput = { name: string; username: string; email: string; password: string; avatarUrl?: string };
export type LoginInput = { identifier: string; password: string };
export type ProfileInput = { name?: string; username?: string; avatarUrl?: string };

async function startSession(res: AuthResponse) {
  queryClient.clear();
  await useSession.getState().signIn(res.accessToken, res.user);
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<AuthResponse>('/auth/login', input),
    onSuccess: startSession,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<AuthResponse>('/auth/register', input),
    onSuccess: startSession,
  });
}

export async function signOut() {
  await unregisterPush(); // while we still have the token to authenticate the call
  await useSession.getState().signOut();
  queryClient.clear();
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const me = await api.get<Me>('/me');
      await useSession.getState().setUser(me);
      return me;
    },
  });
}

export function useStats() {
  return useQuery({ queryKey: ['me', 'stats'], queryFn: () => api.get<ProfileStats>('/me/stats') });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: ProfileInput) => api.patch<Me>('/me', input),
    onSuccess: async (me) => {
      await useSession.getState().setUser(me);
      queryClient.setQueryData(['me'], me);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => api.post<void>('/me/password', input),
  });
}

export type HistoryKind = 'plans' | 'polls' | 'pickup-offers' | 'pickup-requests';
type HistoryItem = { plans: Plan; polls: Poll; 'pickup-offers': PickupOffer; 'pickup-requests': PickupRequest };

export function useHistory<K extends HistoryKind>(kind: K) {
  return useQuery({
    queryKey: ['me', kind],
    queryFn: () => api.get<Page<HistoryItem[K]>>(`/me/${kind}`, { size: 50 }),
  });
}

export function useAcceptTerms() {
  return useMutation({
    mutationFn: () => api.post<Me>('/me/accept-terms'),
    onSuccess: async (me) => {
      await useSession.getState().setUser(me);
      queryClient.setQueryData(['me'], me);
    },
  });
}

/** Permanently deletes the account on the server, then signs out locally. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => api.delete<void>('/me', { password }),
    onSuccess: async () => {
      await useSession.getState().signOut();
      queryClient.clear();
    },
  });
}
