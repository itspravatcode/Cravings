import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet, type SheetAction } from '@/components/ActionSheet';
import { Avatar, AvatarStack } from '@/components/Avatar';
import { ReportSheet, type ReportTargetInput } from '@/components/ReportSheet';
import { StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { FilterBar } from '@/components/Chip';
import { FeedCard } from '@/components/FeedCards';
import { GroupIcon, groupTypeLabel } from '@/components/GroupBits';
import { Icon } from '@/components/Icon';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { TextField } from '@/components/TextField';
import { useChatUnread } from '@/features/chat';
import { useBlock, useBlocked, useGroupReports } from '@/features/safety';
import { useFeed } from '@/features/feed';
import {
  useDeleteGroup, useGroup, useInviteUser, useJoinRequests, useLeaveGroup, useMemberAction, useMembers, useRegenerateCode,
} from '@/features/groups';
import { errorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { MemberView } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';

type Tab = 'feed' | 'history' | 'members';

export default function GroupDetails() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const me = useSession((s) => s.user);
  const group = useGroup(id);
  const [tab, setTab] = useState<Tab>('feed');
  const isOwner = group.data?.myRole === 'OWNER';
  const feed = useFeed(useMemo(() => ({ groupId: id, includeInactive: tab === 'history' }), [id, tab]));
  const members = useMembers(id);
  const requests = useJoinRequests(id, isOwner);
  const memberAction = useMemberAction(id);
  const leave = useLeaveGroup();
  const del = useDeleteGroup();
  const regen = useRegenerateCode(id);
  const invite = useInviteUser(id);
  const [username, setUsername] = useState('');
  const { data: chatUnread } = useChatUnread();
  const reports = useGroupReports(id, isOwner);
  const blocked = useBlocked();
  const block = useBlock();
  const [menuFor, setMenuFor] = useState<MemberView | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTargetInput | null>(null);

  if (group.isLoading) return <SafeAreaView style={styles.safe}><Loading /></SafeAreaView>;
  if (!group.data) return <SafeAreaView style={styles.safe}><ErrorState error={group.error} onRetry={group.refetch} /></SafeAreaView>;
  const g = group.data;

  const shareCode = () => Share.share({ message: `Join "${g.name}" on Cravings with invite code ${g.inviteCode}` });
  const act = (action: 'approve' | 'decline' | 'remove' | 'make-owner', m: MemberView, confirm?: string) => {
    const run = () => memberAction.mutate({ action, userId: m.user.id }, { onError: (e) => Alert.alert('Something went wrong', errorMessage(e)) });
    if (confirm) Alert.alert(confirm, undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', style: 'destructive', onPress: run }]);
    else run();
  };
  const manageMember = (m: MemberView) => {
    if (m.user.id !== me?.id) setMenuFor(m);
  };
  const memberActions = (m: MemberView): SheetAction[] => {
    const isBlocked = blocked.data?.some((u) => u.id === m.user.id) ?? false;
    const actions: SheetAction[] = [
      { label: `Report ${m.user.name}`, icon: 'flag-outline', onPress: () => setReportTarget({ targetType: 'USER', targetId: m.user.id, groupId: id }) },
      isBlocked
        ? { label: `Unblock ${m.user.name}`, icon: 'checkmark-circle-outline', onPress: () => block.mutate({ userId: m.user.id, block: false }) }
        : {
            label: `Block ${m.user.name}`, icon: 'ban-outline', destructive: true,
            onPress: () => Alert.alert(`Block ${m.user.name}?`, "You won't see their messages, posts or notifications. They won't be told.", [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Block', style: 'destructive', onPress: () => block.mutate({ userId: m.user.id, block: true }, { onError: (e) => Alert.alert("Couldn't block", errorMessage(e)) }) },
            ]),
          },
    ];
    if (isOwner) {
      actions.push({ label: 'Make owner', icon: 'ribbon-outline', onPress: () => act('make-owner', m, `Make ${m.user.name} the owner? You'll become a regular member.`) });
      actions.push({ label: 'Remove from group', icon: 'person-remove-outline', destructive: true, onPress: () => act('remove', m, `Remove ${m.user.name}?`) });
    }
    return actions;
  };
  const leaveOrDelete = () => {
    if (isOwner) {
      Alert.alert(`Delete ${g.name}?`, 'This removes the group and all its plans, polls and pickups for everyone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => del.mutate(id, { onSuccess: () => router.replace('/groups'), onError: (e) => Alert.alert("Couldn't delete", errorMessage(e)) }) },
      ]);
    } else {
      Alert.alert(`Leave ${g.name}?`, "You'll lose access to its content and be removed from its upcoming plans.", [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => leave.mutate(id, { onSuccess: () => router.replace('/groups'), onError: (e) => Alert.alert("Couldn't leave", errorMessage(e)) }) },
      ]);
    }
  };
  const sendInvite = () => invite.mutate(username, {
    onSuccess: () => { setUsername(''); Alert.alert('Invite sent', 'They will see it in their Activity.'); },
    onError: (e) => Alert.alert("Couldn't invite", errorMessage(e)),
  });

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Icon name="arrow-back" size={24} /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={leaveOrDelete} hitSlop={12} accessibilityLabel={isOwner ? 'Delete group' : 'Leave group'}>
          <Icon name={isOwner ? 'trash-outline' : 'exit-outline'} size={22} color={colors.danger} />
        </Pressable>
      </View>
      <View style={styles.hero}>
        <GroupIcon type={g.type} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={font.heading}>{g.name}</Text>
          <Text style={font.small}>{g.memberCount} members · {g.joinMode === 'APPROVAL' ? 'Approval needed' : 'Private'} · {groupTypeLabel(g.type)}</Text>
        </View>
      </View>
      {g.description && <Text style={font.small}>{g.description}</Text>}
      {isOwner && (reports.data?.length ?? 0) > 0 && (
        <Pressable onPress={() => router.push(`/reports/${id}`)} style={styles.reportsBanner} accessibilityRole="button">
          <Icon name="flag" size={18} color={colors.danger} />
          <Text style={[font.body, { flex: 1, color: colors.danger, fontWeight: '600' }]}>
            {reports.data!.length} report{reports.data!.length === 1 ? '' : 's'} to review
          </Text>
          <Icon name="chevron-forward" size={18} color={colors.danger} />
        </Pressable>
      )}
      <AvatarStack users={g.membersPreview} total={g.memberCount} size={32} />
      <View style={styles.actionsRow}>
        <Pressable onPress={() => router.push(`/chat/${id}`)} style={[styles.invite, styles.chatBtn]} accessibilityLabel="Open group chat">
          <Icon name="chatbubbles" size={18} color="#fff" />
          <Text style={[styles.inviteText, { color: '#fff' }]}>Chat</Text>
          {!!chatUnread?.byGroup[id] && <View style={styles.chatBadge}><Text style={styles.chatBadgeText}>{chatUnread.byGroup[id]}</Text></View>}
        </Pressable>
        <Pressable onPress={shareCode} style={[styles.invite, { flex: 1 }]}>
          <Icon name="person-add-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.inviteText}>Invite · <Text style={{ letterSpacing: 1.5 }}>{g.inviteCode}</Text></Text>
        </Pressable>
      </View>
      <FilterBar<Tab> options={[{ value: 'feed', label: 'Feed' }, { value: 'history', label: 'History' }, { value: 'members', label: 'Members' }]} value={tab} onChange={setTab} />
    </View>
  );

  if (tab === 'members') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <FlatList
          data={members.data ?? []}
          keyExtractor={(m) => String(m.user.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={{ gap: spacing.md }}>
              {header}
              <View style={styles.inviteRow}>
                <View style={{ flex: 1 }}><TextField icon="at-outline" placeholder="Invite by username" autoCapitalize="none" value={username} onChangeText={setUsername} /></View>
                <Button title="Invite" size="sm" onPress={sendInvite} loading={invite.isPending} disabled={!username.trim()} />
              </View>
              {isOwner && (requests.data?.length ?? 0) > 0 && (
                <View style={{ gap: spacing.sm }}>
                  <Text style={font.subheading}>Join requests</Text>
                  {requests.data!.map((m) => (
                    <View key={m.user.id} style={styles.member}>
                      <Avatar user={m.user} />
                      <Text style={[font.body, { flex: 1 }]}>{m.user.name}</Text>
                      <Button title="Decline" size="sm" variant="ghost" onPress={() => act('decline', m)} />
                      <Button title="Approve" size="sm" onPress={() => act('approve', m)} />
                    </View>
                  ))}
                </View>
              )}
              {isOwner && <Button title="Get a new invite code" variant="ghost" size="sm" icon="refresh" loading={regen.isPending} onPress={() => regen.mutate()} />}
              <Text style={font.subheading}>Members</Text>
            </View>
          }
          renderItem={({ item: m }) => (
            <Pressable onPress={() => manageMember(m)} style={styles.member}>
              <Avatar user={m.user} />
              <View style={{ flex: 1 }}>
                <Text style={font.body}>{m.user.name}{m.user.id === me?.id ? ' (you)' : ''}</Text>
                <Text style={font.tiny}>@{m.user.username}</Text>
              </View>
              {m.role === 'OWNER' && <StatusBadge label="Owner" tone="warn" />}
              {blocked.data?.some((u) => u.id === m.user.id) && <StatusBadge label="Blocked" tone="bad" />}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={members.isLoading ? <Loading /> : undefined}
        />
        <ActionSheet visible={!!menuFor} title={menuFor ? `@${menuFor.user.username}` : undefined} actions={menuFor ? memberActions(menuFor) : []} onClose={() => setMenuFor(null)} />
        <ReportSheet target={reportTarget} what="member" onClose={() => setReportTarget(null)} />
      </SafeAreaView>
    );
  }

  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(i) => `${i.type}-${i.type === 'PLAN' ? i.plan.id : i.type === 'POLL' ? i.poll.id : i.pickup.id}`}
        renderItem={({ item }) => <FeedCard item={item} showGroup={false} />}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={feed.isLoading ? <Loading /> : feed.isError ? <ErrorState error={feed.error} onRetry={feed.refetch} /> : (
          <EmptyState icon="sparkles-outline" title={tab === 'history' ? 'No history yet' : 'Nothing active right now'}
            message={g.memberCount === 1 ? 'Share the invite code so others can join.' : 'Create a plan, poll or pickup for this group.'}
            action={<Button title="Create something" variant="secondary" onPress={() => router.push('/create')} />} />
        )}
        refreshControl={<RefreshControl refreshing={feed.isRefetching && !feed.isFetchingNextPage} onRefresh={() => { void feed.refetch(); void group.refetch(); }} tintColor={colors.primary} />}
        onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  invite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: 14, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  inviteText: { color: colors.primaryDark, fontWeight: '700', flexShrink: 1 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  reportsBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.dangerSoft },
  chatBtn: { backgroundColor: colors.primary, paddingHorizontal: 20 },
  chatBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  chatBadgeText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  member: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
