import { create } from 'zustand';
import { SnackPlan } from '@/types';
import { api } from '@/services/api';

interface PlanState {
  plans: SnackPlan[];
  isLoading: boolean;
  error: string | null;
  fetchPlans: (groupId?: string) => Promise<void>;
  createPlan: (data: Partial<SnackPlan>) => Promise<SnackPlan | null>;
  joinPlan: (planId: string, userId: string) => Promise<void>;
  leavePlan: (planId: string, userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  plans: [],
  isLoading: false,
  error: null,

  fetchPlans: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const plans = await api.getPlans(groupId);
      set({ plans, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load plans' });
    }
  },

  createPlan: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await api.createPlan(data);
      set((state) => ({
        plans: [...state.plans, plan],
        isLoading: false,
        error: null,
      }));
      return plan;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to create plan' });
      return null;
    }
  },

  joinPlan: async (planId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.joinPlan(planId);
      set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId ? { ...p, participantIds: [...p.participantIds, userId] } : p
        ),
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to join plan' });
    }
  },

  leavePlan: async (planId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.leavePlan(planId);
      set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? { ...p, participantIds: p.participantIds.filter((id) => id !== userId), status: 'OPEN' }
            : p
        ),
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to leave plan' });
    }
  },

  setError: (error) => set({ error }),
}));