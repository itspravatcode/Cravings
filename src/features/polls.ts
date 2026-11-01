import { create } from 'zustand';
import { Poll } from '@/types';
import { api } from '@/services/api';

interface PollState {
  polls: Poll[];
  isLoading: boolean;
  error: string | null;
  fetchPolls: (groupId: string) => Promise<void>;
  createPoll: (data: Partial<Poll>) => Promise<Poll | null>;
  votePoll: (pollId: string, optionId: string, userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const usePollStore = create<PollState>((set) => ({
  polls: [],
  isLoading: false,
  error: null,

  fetchPolls: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const polls = await api.getPolls(groupId);
      set({ polls, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load polls' });
    }
  },

  createPoll: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const poll = await api.createPoll(data);
      set((state) => ({
        polls: [...state.polls, poll],
        isLoading: false,
        error: null,
      }));
      return poll;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to create poll' });
      return null;
    }
  },

  votePoll: async (pollId, optionId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.votePoll(pollId, optionId);
      // Refresh polls for the group to reflect vote
      const current = usePollStore.getState();
      const poll = current.polls.find((p) => p.id === pollId);
      if (poll) {
        const updated = await api.getPolls(poll.groupId);
        set({ polls: updated, isLoading: false, error: null });
        return;
      }
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to vote' });
    }
  },

  setError: (error) => set({ error }),
}));