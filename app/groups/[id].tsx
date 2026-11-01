import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGroupStore } from '@/features/groups';
import { usePlanStore } from '@/features/plans';
import { usePollStore } from '@/features/polls';
import { usePickupStore } from '@/features/pickups';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups, fetchGroups, isLoading: isLoadingGroups } = useGroupStore.getState();
  const { plans, fetchPlans, isLoading: isLoadingPlans } = usePlanStore.getState();
  const { polls, fetchPolls, isLoading: isLoadingPolls } = usePollStore.getState();
  const { offers, fetchPickups, isLoading: isLoadingPickups } = usePickupStore.getState();

  const group = groups.find((g) => g.id === id);
  const isMember = group?.memberIds.includes('user_1') ?? false;
  const groupPlans = plans.filter((p) => p.groupId === id);
  const groupPolls = polls.filter((p) => p.groupId === id);
  const groupPickups = offers.filter((o) => o.groupId === id);

  const [activeTab, setActiveTab] = React.useState<'feed' | 'members'>('feed');

  React.useEffect(() => {
    fetchGroups();
    fetchPlans();
    fetchPolls('group_1');
    fetchPickups('group_1');
  }, [id, fetchGroups, fetchPlans, fetchPolls, fetchPickups]);

  const handleJoin = () => {
    router.push('/create');
  };

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Group not found</Text>
      </View>
    );
  }

  const isLoading = isLoadingGroups || isLoadingPlans || isLoadingPolls || isLoadingPickups;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerImage}>
        <Text style={styles.headerImageText}>🍔</Text>
      </View>
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => {}} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreText}>…</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.groupHeader}>
        <View style={styles.groupIconBadge}>
          <Text style={styles.groupIconText}>🏢</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupType}>
            {group.memberIds.length} members{'  ·  '}
            {group.type} · Snacks · Good Vibes
          </Text>
        </View>
        {!isMember ? (
          <Button title="Join Group" variant="outline" onPress={handleJoin} style={styles.joinBtn} />
        ) : (
          <View style={styles.memberAvatars}>
            {group.memberIds.slice(0, 5).map((pid) => (
              <TouchableOpacity key={pid} style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{pid.slice(-1).toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            {group.memberIds.length > 5 && (
              <View style={styles.memberAvatarMore}>
                <Text style={styles.memberAvatarMoreText}>+{group.memberIds.length - 5}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.inviteSection}>
        <TouchableOpacity style={styles.inviteBtn}>
          <Text style={styles.inviteIcon}>👥</Text>
          <Text style={styles.inviteText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('feed')}
          style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
        >
          <Text style={[styles.tabLabel, activeTab === 'feed' && styles.tabLabelActive]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('members')}
          style={[styles.tab, activeTab === 'members' && styles.tabActive]}
        >
          <Text style={[styles.tabLabel, activeTab === 'members' && styles.tabLabelActive]}>Members</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={(activeTab === 'feed' ? [...groupPlans, ...groupPolls, ...groupPickups] : group.memberIds) as any}
        keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          if (typeof item === 'string') {
            return (
              <TouchableOpacity style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{item.slice(-1).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>User {item.slice(-1)}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity style={styles.feedRow}>
              <Text style={styles.feedType}>{item.title}</Text>
              <Text style={styles.feedTime}>2h ago</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImageText: {
    fontSize: 60,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: '#fff',
  },
  moreBtn: {
    padding: 8,
  },
  moreText: {
    fontSize: 20,
    color: '#fff',
  },
  groupHeader: {
    padding: 20,
    marginTop: -40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  groupType: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  joinBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  memberAvatars: {
    flexDirection: 'row',
    gap: 6,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  memberAvatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberAvatarMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  inviteSection: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inviteIcon: {
    fontSize: 18,
  },
  inviteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 0,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  feedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  feedType: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  feedTime: {
    fontSize: 13,
    color: colors.textMuted,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  memberName: {
    fontSize: 15,
    color: colors.text,
  },
  error: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
