import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FeedItem, FeedType, Id, Page } from '@/lib/types';

export type FeedFilter = { types?: FeedType[]; groupId?: Id; includeInactive?: boolean };

export function useFeed(filter: FeedFilter) {
  return useInfiniteQuery({
    queryKey: ['feed', filter],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      api.get<Page<FeedItem>>('/feed', {
        type: filter.types,
        groupId: filter.groupId,
        includeInactive: filter.includeInactive || undefined,
        page: pageParam,
        size: 15,
      }),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}
