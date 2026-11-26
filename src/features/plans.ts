import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Id, Plan, UserSummary } from '@/lib/types';
import { invalidateContent, queryClient } from './queryClient';

export type PlanInput = {
  groupId: Id;
  title: string;
  description?: string;
  location: string;
  startsAt: string;
  participantLimit?: number;
  imageUrl?: string;
};

export type PlanUpdate = Partial<Omit<PlanInput, 'groupId'>> & { clearParticipantLimit?: boolean };

const store = (plan: Plan) => {
  queryClient.setQueryData(['plans', plan.id], plan);
  queryClient.invalidateQueries({ queryKey: ['plans', plan.id, 'participants'] });
  return invalidateContent();
};

export function usePlan(id: Id) {
  return useQuery({ queryKey: ['plans', id], queryFn: () => api.get<Plan>(`/plans/${id}`) });
}

export function useParticipants(id: Id) {
  return useQuery({ queryKey: ['plans', id, 'participants'], queryFn: () => api.get<UserSummary[]>(`/plans/${id}/participants`) });
}

export function useCreatePlan() {
  return useMutation({ mutationFn: (input: PlanInput) => api.post<Plan>('/plans', input), onSuccess: store });
}

export function useUpdatePlan(id: Id) {
  return useMutation({ mutationFn: (input: PlanUpdate) => api.patch<Plan>(`/plans/${id}`, input), onSuccess: store });
}

export function usePlanAction() {
  return useMutation({
    mutationFn: ({ id, action }: { id: Id; action: 'join' | 'leave' | 'cancel' }) => api.post<Plan>(`/plans/${id}/${action}`),
    onSuccess: store,
  });
}
