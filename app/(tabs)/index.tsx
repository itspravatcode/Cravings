import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useGroupStore } from '@/features/groups';
import { usePlanStore } from '@/features/plans';
import { usePollStore } from '@/features/polls';
import { usePickupStore } from '@/features/pickups';
import { useAuthStore } from '@/features/auth';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import { Group, SnackPlan, Poll, PickupOffer } from '@/types';

const TABS: { key: 'all' | 'plans' | 'polls' | 'pickups'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'plans', label: 'Plans' },
  { key: 'polls', label: 'Polls' },
  { key: 'pickups', label: 'Pickups' },
];

const FEED_IMAGES: Record<string, string> = {
  plan: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  poll: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
  pickup: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
};

type FeedCardProps = {
  type: 'plan' | 'poll' | 'pickup';
  title: string;
  subtitle: string;
  time: string;
  group: Group;
  onPress: () => void;
  participants?: number;
  participantLimit?: number;
  options?: Array<{ text: string; votes: number; percent: number }>;
  votedTotal?: number;
};

const FeedCard: React.FC<FeedCardProps> = ({
  type,
  title,
  subtitle,
  time,
  group,
  participants,
  participantLimit,
  options,
  votedTotal,
  onPress,
}) => {
  const timeText = new Date(time).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
        <View style={styles.row}>
          <View style={styles.iconBadge}><Text style={styles.iconText}>{type === 'plan' ? '🍽️' : type === 'poll' ? '🗳️' : '🛒'}</Text></View>
          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.groupMeta}>
              <Text style={styles.groupMetaText}>{group.name}</Text>
              <Text style={styles.groupMetaText}>{group.type} · Snacks · Good Vibes</Text>
            </View>
            {type === 'plan' && participants != null && (
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{timeText}</Text>
                <Text style={styles.meta}>{participants}/{participantLimit ?? 8} going</Text>
              </View>
            )}
            {type === 'poll' && (
              <View style={styles.pollOptions}>
                {options?.map((o) => (
                  <View key={o.text} style={styles.pollOptionRow}>
                    <Text style={styles.pollOptionText}>{o.text}</Text>
                    <View style={styles.pollBarTrack}>
                      <View style={[styles.pollBarFill, { width: `${o.percent}%` }]} />
                    </View>
                    <Text style={styles.pollPercent}>{o.percent}%</Text>
                  </View>
                ))}
                <Text style={styles.pollVoted}>{votedTotal ?? 0} voted</Text>
              </View>
            )}
            {type === 'pickup' && (
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{timeText}</Text>
              </View>
            )}
          </View>
          <View style={styles.imageWrap}>
            <Image source={{ uri: FEED_IMAGES[type] }} style={styles.feedImage} resizeMode="cover" />
          </View>
        </View>
        {type === 'plan' && (
          <View style={styles.joinWrap}>
            <Button title="Join" variant="outline" onPress={onPress} style={styles.joinBtn} />
          </View>
        )}

      </TouchableOpacity>
    </Card>
  );
};
export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuthStore.getState();
  const { groups, fetchGroups } = useGroupStore.getState();
  const { plans, fetchPlans } = usePlanStore.getState();
  const { polls, fetchPolls } = usePollStore.getState();
  const { offers, fetchPickups } = usePickupStore.getState();

  const [activeTab, setActiveTab] = React.useState<'all' | 'plans' | 'polls' | 'pickups'>('all');

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        await Promise.all([
          fetchGroups(),
          fetchPlans(),
          fetchPolls('group_1'),
          fetchPickups('group_1'),
        ]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadAll();
    return () => { mounted = false; };
  }, [fetchGroups, fetchPlans, fetchPolls, fetchPickups]);

  const items = React.useMemo(() => {
    const feed: FeedCardProps[] = [];

    plans.forEach((p) => {
      const group = groups.find((g) => g.id === p.groupId);
      if (group && activeTab !== 'polls' && activeTab !== 'pickups') {
        feed.push({
          type: 'plan',
          title: p.title,
          subtitle: p.description,
          time: p.time,
          group,
          participants: p.participantIds.length,
          participantLimit: p.participantLimit,
          onPress: () => router.push(`/plans/${p.id}`),
        });
      }
    });

    polls.forEach((p) => {
      const group = groups.find((g) => g.id === p.groupId);
      if (group && activeTab !== 'plans' && activeTab !== 'pickups') {
        const total = p.options.reduce((a, b) => a + b.voteCount, 0);
        feed.push({
          type: 'poll',
          title: p.question,
          subtitle: '',
          time: p.createdAt,
          group,
          options: p.options.map((o) => ({
            text: o.text,
            votes: o.voteCount,
            percent: total ? Math.round((o.voteCount / total) * 100) : 0,
          })),
          votedTotal: total,
          onPress: () => router.push(`/poll/${p.id}`),
        });
      }
    });

    offers.forEach((o) => {
      const group = groups.find((g) => g.id === o.groupId);
      if (group && activeTab !== 'plans' && activeTab !== 'polls') {
        feed.push({
          type: 'pickup',
          title: o.title,
          subtitle: o.description,
          time: o.time,
          group,
          onPress: () => router.push(`/pickup/${o.id}`),
        });
      }
    });

    return feed.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [plans, polls, offers, groups, activeTab]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Cravings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => {}}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/profile')}>
            <Avatar size={32} name={user?.name || 'You'} src={user?.avatarUrl} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting card */}
      <View style={styles.greetingCard}>
        <View style={styles.greetingText}>
          <Text style={styles.greetingLabel}>Good evening,</Text>
          <Text style={styles.greetingTitle}>Ready for some snacks?</Text>
        </View>
        <Text style={styles.greetingIcon}>🍔</Text>
      </View>

      {/* Category tabs */}
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

      {/* Feed list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.title + item.time}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <FeedCard
            type={item.type}
            title={item.title}
            subtitle={item.subtitle}
            time={item.time}
            group={item.group}
            participants={item.participants}
            participantLimit={item.participantLimit}
            options={item.options}
            votedTotal={item.votedTotal}
            onPress={item.onPress}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 8,
  },
  iconText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  greetingCard: {
    backgroundColor: colors.amber,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 15,
    color: '#7C2D12',
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#451A03',
  },
  greetingIcon: {
    fontSize: 44,
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
    gap: 12,
  },
  card: {
    marginHorizontal: 0,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgePoll: {
    backgroundColor: '#F3E8FF',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  groupMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  pollOptions: {
    marginTop: 8,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pollOptionText: {
    fontSize: 13,
    color: colors.text,
    width: 95,
  },
  pollBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  pollPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 32,
  },
  pollVoted: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  imageWrap: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedImage: {
    width: 70,
    height: 70,
  },
  joinWrap: {
    alignItems: 'flex-end',
  },
  joinBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});