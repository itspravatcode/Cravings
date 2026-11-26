import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FilterBar } from '@/components/Chip';
import { FeedCard } from '@/components/FeedCards';
import { Icon } from '@/components/Icon';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useUnreadCount } from '@/features/activity';
import { useFeed } from '@/features/feed';
import { useMyGroups } from '@/features/groups';
import { greeting } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { FeedType } from '@/lib/types';
import { colors, radius, spacing } from '@/lib/theme';

type Filter = 'ALL' | FeedType;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PLAN', label: 'Plans' },
  { value: 'POLL', label: 'Polls' },
  { value: 'PICKUP', label: 'Pickups' },
];

export default function Home() {
  const user = useSession((s) => s.user);
  const [filter, setFilter] = useState<Filter>('ALL');
  const feed = useFeed(useMemo(() => (filter === 'ALL' ? {} : { types: [filter] }), [filter]));
  const groups = useMyGroups();
  const { data: unread } = useUnreadCount();
  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];

  // Feed rule: refresh when the user comes back to Home.
  const { refetch: refetchOnFocus } = feed;
  useFocusEffect(useCallback(() => { void refetchOnFocus(); }, [refetchOnFocus]));

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Cravings</Text>
        <Pressable onPress={() => router.push('/activity')} hitSlop={8} accessibilityLabel="Activity">
          <Icon name="notifications-outline" size={24} />
          {!!unread && <View style={styles.dot} />}
        </Pressable>
        {user && (
          <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Profile">
            <Avatar user={user} size={36} />
          </Pressable>
        )}
      </View>
      <View style={styles.greeting}>
        <View style={styles.greetingIcon}><Icon name="fast-food-outline" size={24} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingText}>{greeting()}, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.greetingSub}>Ready for some snacks?</Text>
        </View>
      </View>
      <FilterBar options={FILTERS} value={filter} onChange={setFilter} />
    </View>
  );

  const noGroups = groups.data && groups.data.filter((g) => g.myStatus === 'ACTIVE').length === 0;
  const empty = feed.isLoading ? <Loading /> : feed.isError ? <ErrorState error={feed.error} onRetry={feed.refetch} /> : noGroups ? (
    <EmptyState icon="people-outline" title="Join your first group"
      message="Cravings happens inside groups. Create one for your office or friends, or join with an invite code."
      action={<View style={{ gap: spacing.sm, alignSelf: 'stretch' }}>
        <Button title="Create a group" onPress={() => router.push('/groups/new')} />
        <Button title="Join with a code" variant="outline" onPress={() => router.push('/groups/join')} />
      </View>} />
  ) : (
    <EmptyState icon="sparkles-outline" title="Nothing happening yet"
      message="Start a snack plan, ask the group what to eat, or offer a pickup."
      action={<Button title="Create something" onPress={() => router.push('/create')} />} />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(i) => `${i.type}-${i.type === 'PLAN' ? i.plan.id : i.type === 'POLL' ? i.poll.id : i.pickup.id}`}
        renderItem={({ item }) => <FeedCard item={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={feed.isRefetching && !feed.isFetchingNextPage} onRefresh={() => void feed.refetch()} tintColor={colors.primary} />}
        onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={feed.isFetchingNextPage ? <Loading /> : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  brand: { flex: 1, fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  dot: { position: 'absolute', top: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.background },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  greetingIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  greetingText: { fontSize: 15, fontWeight: '700', color: colors.text },
  greetingSub: { fontSize: 13, color: colors.textSecondary },
});
