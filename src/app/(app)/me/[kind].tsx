import { router, useLocalSearchParams } from 'expo-router';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { PickupCard, PlanCard, PollCard } from '@/components/FeedCards';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useHistory, type HistoryKind } from '@/features/auth';
import { CATEGORY_LABEL } from '@/features/pickups';
import { timeAgo } from '@/lib/format';
import type { PickupOffer, PickupRequest, Plan, Poll } from '@/lib/types';
import { colors, font } from '@/lib/theme';

const TITLES: Record<HistoryKind, { title: string; empty: string }> = {
  plans: { title: 'My Plans', empty: "Plans you join show up here." },
  polls: { title: 'My Polls', empty: 'Polls you vote in show up here.' },
  'pickup-offers': { title: 'My Pickup Offers', empty: "Offers you post when you're heading out show up here." },
  'pickup-requests': { title: 'My Pickup Requests', empty: 'Items you ask others to pick up show up here.' },
};

export default function History() {
  const kind = useLocalSearchParams<{ kind: HistoryKind }>().kind;
  const meta = TITLES[kind] ?? TITLES.plans;
  const q = useHistory(kind);
  const items = q.data?.items ?? [];

  return (
    <Screen back title={meta.title} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={colors.primary} />}>
      {q.isLoading ? <Loading /> : q.isError ? <ErrorState error={q.error} onRetry={q.refetch} /> : items.length === 0 ? (
        <EmptyState icon="time-outline" title="Nothing here yet" message={meta.empty} />
      ) : items.map((item) => {
        switch (kind) {
          case 'plans': return <PlanCard key={item.id} plan={item as Plan} showGroup />;
          case 'polls': return <PollCard key={item.id} poll={item as Poll} showGroup />;
          case 'pickup-offers': return <PickupCard key={item.id} offer={item as PickupOffer} showGroup />;
          default: {
            const r = item as PickupRequest;
            return (
              <Card key={r.id} onPress={() => router.push(`/pickups/${r.offerId}`)}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={font.subheading}>{r.quantity} × {r.itemName}</Text>
                    <Text style={font.small}>from {r.offerDestination} · {CATEGORY_LABEL[r.category]} · {timeAgo(r.createdAt)}</Text>
                  </View>
                  <StatusBadge label={r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    tone={r.status === 'ACCEPTED' || r.status === 'COMPLETED' ? 'good' : r.status === 'PENDING' ? 'warn' : 'neutral'} />
                </View>
              </Card>
            );
          }
        }
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 8 } });
