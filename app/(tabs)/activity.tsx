import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useGroupStore } from '@/features/groups';
import { usePlanStore } from '@/features/plans';
import { usePollStore } from '@/features/polls';
import { usePickupStore } from '@/features/pickups';
import { colors } from '@/theme/colors';

const TABS: { key: 'all' | 'plans' | 'polls' | 'pickups'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'plans', label: 'Plans' },
  { key: 'polls', label: 'Polls' },
  { key: 'pickups', label: 'Pickups' },
];

export default function ActivityScreen() {
  const { groups, fetchGroups } = useGroupStore.getState();
  const { plans, fetchPlans, isLoading: isLoadingPlans } = usePlanStore.getState();
  const { polls, fetchPolls, isLoading: isLoadingPolls } = usePollStore.getState();
  const { offers, fetchPickups, isLoading: isLoadingPickups } = usePickupStore.getState();

  const [activeTab, setActiveTab] = React.useState<'all' | 'plans' | 'polls' | 'pickups'>('all');

  React.useEffect(() => {
    fetchGroups();
    fetchPlans();
    fetchPolls('group_1');
    fetchPickups('group_1');
  }, [fetchGroups, fetchPlans, fetchPolls, fetchPickups]);

  const activityItems = React.useMemo(() => {
    const items: { id: string; actor: string; action: string; target: string; time: string; icon: string; bgColor: string }[] = [];
    const now = new Date();
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

    plans.slice(0, 4).forEach((p, i) => {
      const actor = p.creatorId === 'user_1' ? 'You' : `User ${p.creatorId.slice(-1)}`;
      items.push({ id: `plan_${p.id}`, actor, action: 'created a snack plan', target: p.title, time: `${3 - i}h ago`, icon: '🍽️', bgColor: '#E8F5E9' });
    });

    polls.slice(0, 3).forEach((poll, i) => {
      items.push({ id: `poll_${poll.id}`, actor: 'You', action: 'voted in a poll', target: poll.question, time: `${4 - i}h ago`, icon: '🗳️', bgColor: '#F3E8FF' });
    });

    offers.slice(0, 3).forEach((offer, i) => {
      items.push({ id: `pickup_${offer.id}`, actor: 'You', action: 'requested an item', target: offer.title, time: `${5 - i}h ago`, icon: '🛒', bgColor: '#FEF3C7' });
    });

    return items.slice(0, 5);
  }, [plans, polls, offers]);

  if (isLoadingPlans || isLoadingPolls || isLoadingPickups) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading activity…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activityItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.activityRow}>
            <View style={[styles.iconBadge, { backgroundColor: item.bgColor }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.activityInfo}>
              <View style={styles.actorRow}>
                <Text style={styles.actorName}>{item.actor}</Text>
                <Text style={styles.actorAction}>{item.action}</Text>
              </View>
              <Text style={styles.activityTarget}>{item.target}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  activityInfo: {
    flex: 1,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  actorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actorAction: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityTarget: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  loading: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});