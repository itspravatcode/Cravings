import { create } from 'zustand';
import { Group } from '@/types';
import { api } from '@/services/api';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  createGroup: (data: Partial<Group>) => Promise<Group | null>;
  joinGroup: (groupId: string, userId: string) => Promise<void>;
  setCurrentGroup: (group: Group | null) => void;
  setError: (error: string | null) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await api.getGroups();
      set({ groups, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load groups' });
    }
  },

  createGroup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const group = await api.createGroup(data);
      set((state) => ({
        groups: [...state.groups, group],
        isLoading: false,
        error: null,
      }));
      return group;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to create group' });
      return null;
    }
  },

  joinGroup: async (groupId, userId) => {
    set({ isLoading: true, error: null });
    try {
      // Backend join group uses inviteCode query param; we look up the group first
      const group = (await api.getGroups()).find((g) => g.id === groupId);
      if (!group) throw new Error('Group not found');
      await api.joinGroup(group.inviteCode);
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, memberIds: [...g.memberIds, userId] } : g
        ),
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to join group' });
    }
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
  setError: (error) => set({ error }),
}));