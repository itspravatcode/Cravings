import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Id, PickupCategory, PickupOffer, PickupRequest } from '@/lib/types';
import { invalidateContent, queryClient } from './queryClient';

export type OfferInput = { groupId: Id; destination: string; note?: string; availableUntil: string; categories: PickupCategory[] };
export type RequestInput = { itemName: string; category: PickupCategory; quantity: number; note?: string };

export const CATEGORY_LABEL: Record<PickupCategory, string> = { SNACKS: 'Snacks', DRINKS: 'Drinks', ESSENTIALS: 'Essentials' };

const refreshOffer = (offerId: Id) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['pickups', offerId] }),
    invalidateContent(),
  ]);

export function useOffer(id: Id) {
  return useQuery({ queryKey: ['pickups', id], queryFn: () => api.get<PickupOffer>(`/pickups/${id}`) });
}

export function useOfferRequests(id: Id) {
  return useQuery({ queryKey: ['pickups', id, 'requests'], queryFn: () => api.get<PickupRequest[]>(`/pickups/${id}/requests`) });
}

export function useCreateOffer() {
  return useMutation({
    mutationFn: (input: OfferInput) => api.post<PickupOffer>('/pickups', input),
    onSuccess: (offer) => {
      queryClient.setQueryData(['pickups', offer.id], offer);
      return invalidateContent();
    },
  });
}

export function useOfferAction() {
  return useMutation({
    mutationFn: ({ id, action }: { id: Id; action: 'close' | 'cancel' }) => api.post<PickupOffer>(`/pickups/${id}/${action}`),
    onSuccess: (offer) => refreshOffer(offer.id),
  });
}

export function useCreateRequest(offerId: Id) {
  return useMutation({
    mutationFn: (input: RequestInput) => api.post<PickupRequest>(`/pickups/${offerId}/requests`, input),
    onSuccess: () => refreshOffer(offerId),
  });
}

export function useRequestAction() {
  return useMutation({
    mutationFn: ({ id, action }: { id: Id; action: 'accept' | 'decline' | 'complete' | 'cancel' }) =>
      api.post<PickupRequest>(`/pickups/requests/${id}/${action}`),
    onSuccess: (r) => refreshOffer(r.offerId),
  });
}
