import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { FilterBar } from '@/components/Chip';
import { Icon, type IconName } from '@/components/Icon';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { describeActivity, useActivity, useMarkRead } from '@/features/activity';
import { timeAgo } from '@/lib/format';
import { hrefForActivity } from '@/lib/links';
import type { Activity, ActivityCategory } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';

const FILTERS: { value: ActivityCategory; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PLANS', label: 'Plans' },
  { value: 'POLLS', label: 'Polls' },
  { value: 'PICKUPS', label: 'Pickups' },
  { value: 'GROUPS', label: 'Groups' },
];

const SUBJECT_ICON: Record<Activity['subjectType'], { icon: IconName; color: string; soft: string }> = {
  GROUP: { icon: 'people', color: colors.primary, soft: colors.primarySoft },
  PLAN: { icon: 'fast-food', color: colors.plan, soft: colors.planSoft },
  POLL: { icon: 'bar-chart', color: colors.poll, soft: colors.pollSoft },
  PICKUP_OFFER: { icon: 'bag-handle', color: colors.pickup, soft: colors.pickupSoft },
  PICKUP_REQUEST: { icon: 'bag-check', color: colors.pickup, soft: colors.pickupSoft },
};


export default function ActivityScreen() {
  const [category, setCategory] = useState<ActivityCategory>('ALL');
  const activity = useActivity(category);
  const markRead = useMarkRead();
  const items = activity.data?.pages.flatMap((p) => p.items) ?? [];
  const { refetch: refetchOnFocus } = activity;
  useFocusEffect(useCallback(() => { void refetchOnFocus(); }, [refetchOnFocus]));

  const open = (a: Activity) => {
    if (!a.read) markRead.mutate(a.id);
    router.push(hrefForActivity(a));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Activity</Text>
              {items.some((a) => !a.read) && (
                <Pressable onPress={() => markRead.mutate('all')} hitSlop={8}>
                  <Text style={styles.markAll}>Mark all read</Text>
                </Pressable>
              )}
            </View>
            <FilterBar options={FILTERS} value={category} onChange={setCategory} />
          </View>
        }
        renderItem={({ item: a }) => {
          const { actor, text } = describeActivity(a);
          const look = SUBJECT_ICON[a.subjectType];
          return (
            <Pressable onPress={() => open(a)} style={[styles.row, !a.read && styles.unread]}>
              {a.actor ? <Avatar user={a.actor} size={40} /> : (
                <View style={[styles.icon, { backgroundColor: look.soft }]}><Icon name={look.icon} size={20} color={look.color} /></View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={font.body}>
                  {actor && <Text style={{ fontWeight: '700' }}>{actor} </Text>}
                  {text}
                </Text>
                {a.subjectTitle && <Text style={[font.small, { fontWeight: '600', color: colors.text }]} numberOfLines={1}>{a.subjectTitle}</Text>}
                <Text style={font.tiny}>{timeAgo(a.createdAt)}{a.group ? ` · ${a.group.name}` : ''}</Text>
              </View>
              {!a.read && <View style={styles.dot} />}
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={activity.isLoading ? <Loading /> : activity.isError ? <ErrorState error={activity.error} onRetry={activity.refetch} /> :
          <EmptyState icon="notifications-outline" title="All quiet" message="You'll see joins, votes and pickup updates here." />}
        refreshControl={<RefreshControl refreshing={activity.isRefetching && !activity.isFetchingNextPage} onRefresh={() => void activity.refetch()} tintColor={colors.primary} />}
        onEndReached={() => activity.hasNextPage && !activity.isFetchingNextPage && activity.fetchNextPage()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, flexGrow: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { ...font.heading, fontSize: 24, flex: 1 },
  markAll: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  unread: { borderColor: colors.primary, backgroundColor: '#FFFDFA' },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
