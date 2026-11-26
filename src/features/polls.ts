import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Id, Poll } from '@/lib/types';
import { invalidateContent, queryClient } from './queryClient';

export type PollInput = {
  groupId: Id;
  question: string;
  options: string[];
  closesAt: string;
  allowVoteChange?: boolean;
  publish?: boolean;
};

const store = (poll: Poll) => {
  queryClient.setQueryData(['polls', poll.id], poll);
  return invalidateContent();
};

export function usePoll(id: Id) {
  return useQuery({ queryKey: ['polls', id], queryFn: () => api.get<Poll>(`/polls/${id}`) });
}

export function useCreatePoll() {
  return useMutation({ mutationFn: (input: PollInput) => api.post<Poll>('/polls', input), onSuccess: store });
}

export function useVote() {
  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: Id; optionId: Id }) => api.post<Poll>(`/polls/${pollId}/vote`, { optionId }),
    onSuccess: store,
  });
}

export function usePollAction() {
  return useMutation({
    mutationFn: ({ id, action }: { id: Id; action: 'publish' | 'close' }) => api.post<Poll>(`/polls/${id}/${action}`),
    onSuccess: store,
  });
}

export function useDeleteDraft() {
  return useMutation({ mutationFn: (id: Id) => api.delete<void>(`/polls/${id}`), onSuccess: invalidateContent });
}
