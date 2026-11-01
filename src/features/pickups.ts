import { create } from 'zustand';
import { PickupOffer, PickupRequest } from '@/types';
import { api } from '@/services/api';

interface PickupState {
  offers: PickupOffer[];
  requests: PickupRequest[];
  isLoading: boolean;
  error: string | null;
  fetchPickups: (groupId: string) => Promise<void>;
  createPickup: (data: Partial<PickupOffer>) => Promise<PickupOffer | null>;
  addRequest: (request: PickupRequest) => void;
  updateRequestStatus: (requestId: string, status: PickupRequest['status']) => void;
  completeOffer: (offerId: string) => void;
  setError: (error: string | null) => void;
}

export const usePickupStore = create<PickupState>((set) => ({
  offers: [],
  requests: [],
  isLoading: false,
  error: null,

  fetchPickups: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const offers = await api.getPickups(groupId);
      set({ offers, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load pickups' });
    }
  },

  createPickup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const offer = await api.createPickup(data);
      set((state) => ({
        offers: [...state.offers, offer],
        isLoading: false,
        error: null,
      }));
      return offer;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to create pickup' });
      return null;
    }
  },

  addRequest: (request) =>
    set((state) => ({ requests: [...state.requests, request] })),
  updateRequestStatus: (requestId, status) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status } : r
      ),
    })),
  completeOffer: (offerId) =>
    set((state) => ({
      offers: state.offers.map((o) =>
        o.id === offerId ? { ...o, status: 'COMPLETED' } : o
      ),
    })),

  setError: (error) => set({ error }),
}));