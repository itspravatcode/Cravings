import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionSheet, type SheetAction } from '@/components/ActionSheet';
import { Avatar } from '@/components/Avatar';
import { ReportSheet, type ReportTargetInput } from '@/components/ReportSheet';
import { Icon } from '@/components/Icon';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { discardMessage, markRead, setOpenChat, useChatSender, useDeleteMessage, useMessages } from '@/features/chat';
import { useGroup } from '@/features/groups';
import { useMuteChat } from '@/features/notifications';
import { useBlock } from '@/features/safety';
import { errorMessage } from '@/lib/api';
import { useSocketStatus } from '@/lib/chatSocket';
import { formatTime } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { LocalMessage } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== today.getFullYear() ? ` ${d.getFullYear()}` : ''}`;
}

export default function Chat() {
  const groupId = Number(useLocalSearchParams<{ groupId: string }>().groupId);
  const me = useSession((s) => s.user);
  const group = useGroup(groupId);
  const messages = useMessages(groupId);
  const sender = useChatSender(groupId);
  const del = useDeleteMessage(groupId);
  const mute = useMuteChat(groupId);
  const muted = group.data?.chatMuted ?? false;
  const status = useSocketStatus((s) => s.status);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [menuFor, setMenuFor] = useState<LocalMessage | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTargetInput | null>(null);
  const block = useBlock();

  const items = messages.data?.pages.flatMap((p) => p.items) ?? [];
  const newestServerId = items.find((m) => m.id > 0)?.id;
  const isOwner = group.data?.myRole === 'OWNER';

  // While this screen is focused, incoming messages count as read.
  useFocusEffect(useCallback(() => {
    setOpenChat(groupId);
    return () => setOpenChat(null);
  }, [groupId]));

  useEffect(() => {
    if (newestServerId) void markRead(groupId, newestServerId);
  }, [groupId, newestServerId]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    sender.send(body);
    setDraft('');
  };

  const onLongPress = (m: LocalMessage) => {
    if (m.pending === 'failed' && m.clientId) {
      Alert.alert('Message not sent', undefined, [
        { text: 'Try again', onPress: () => sender.retry(m) },
        { text: 'Delete', style: 'destructive', onPress: () => discardMessage(groupId, m.clientId!) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (m.deleted || m.pending) return;
    setMenuFor(m);
  };

  const confirmDelete = (m: LocalMessage) =>
    Alert.alert(m.sender?.id === me?.id ? 'Delete your message?' : 'Delete this message?', 'It will show as "Message deleted" for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(m.id, { onError: (e) => Alert.alert("Couldn't delete", errorMessage(e)) }) },
    ]);

  const confirmBlock = (m: LocalMessage) => {
    const who = m.sender;
    if (!who) return;
    Alert.alert(`Block ${who.name}?`, "You won't see their messages, posts or notifications. They won't be told.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => block.mutate({ userId: who.id, block: true }, { onError: (e) => Alert.alert("Couldn't block", errorMessage(e)) }) },
    ]);
  };

  const menuActions = (m: LocalMessage): SheetAction[] => {
    const mine = m.sender?.id === me?.id;
    const actions: SheetAction[] = [];
    if (!mine) actions.push({ label: 'Report message', icon: 'flag-outline', onPress: () => setReportTarget({ targetType: 'MESSAGE', targetId: m.id }) });
    if (!mine && m.sender) actions.push({ label: `Block ${m.sender.name}`, icon: 'ban-outline', destructive: true, onPress: () => confirmBlock(m) });
    if (mine || isOwner) actions.push({ label: 'Delete message', icon: 'trash-outline', destructive: true, onPress: () => confirmDelete(m) });
    return actions;
  };

  const renderItem = ({ item: m, index }: { item: LocalMessage; index: number }) => {
    // The list is inverted: index + 1 is the *older* neighbour, index - 1 the newer one.
    const older = items[index + 1];
    const newer = items[index - 1];
    const mine = m.sender?.id === me?.id;
    const startsRun = !older || older.sender?.id !== m.sender?.id || dayLabel(older.createdAt) !== dayLabel(m.createdAt);
    const endsRun = !newer || newer.sender?.id !== m.sender?.id;
    const showDay = !older || dayLabel(older.createdAt) !== dayLabel(m.createdAt);
    return (
      <View>
        {showDay && <Text style={styles.day}>{dayLabel(m.createdAt)}</Text>}
        <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, startsRun && { marginTop: spacing.sm }]}>
          {!mine && <View style={styles.avatarSlot}>{endsRun && m.sender && <Avatar user={m.sender} size={30} />}</View>}
          <Pressable onLongPress={() => onLongPress(m)} onPress={() => m.pending === 'failed' && onLongPress(m)} delayLongPress={300}
            style={[styles.bubble, mine ? styles.mine : styles.theirs, m.deleted && styles.deletedBubble, m.pending === 'failed' && styles.failed]}>
            {!mine && startsRun && <Text style={styles.name}>{m.sender?.name ?? 'Former member'}</Text>}
            {m.deleted ? (
              <Text style={[styles.body, styles.deletedText]}>Message deleted</Text>
            ) : (
              <Text style={[styles.body, mine && { color: '#fff' }]} selectable>{m.body}</Text>
            )}
            <View style={styles.meta}>
              <Text style={[styles.time, mine && { color: 'rgba(255,255,255,0.8)' }]}>{formatTime(new Date(m.createdAt))}</Text>
              {m.pending === 'sending' && <Icon name="time-outline" size={11} color="rgba(255,255,255,0.8)" />}
              {mine && !m.pending && !m.deleted && <Icon name="checkmark" size={12} color="rgba(255,255,255,0.8)" />}
            </View>
          </Pressable>
        </View>
        {m.pending === 'failed' && <Text style={styles.failedText}>Not sent · tap to retry</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back"><Icon name="arrow-back" size={24} /></Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => router.push(`/groups/${groupId}`)}>
          <Text style={font.subheading} numberOfLines={1}>{group.data?.name ?? 'Group chat'}</Text>
          <Text style={font.tiny}>
            {status === 'open' ? `${group.data?.memberCount ?? ''} members` : status === 'connecting' ? 'Connecting…' : 'Offline · messages will sync when you reconnect'}
          </Text>
        </Pressable>
        <Pressable onPress={() => mute.mutate(!muted, { onError: (e) => Alert.alert("Couldn't change", errorMessage(e)) })} hitSlop={10}
          accessibilityLabel={muted ? 'Unmute chat notifications' : 'Mute chat notifications'}>
          <Icon name={muted ? 'notifications-off-outline' : 'notifications-outline'} size={22} color={muted ? colors.textMuted : colors.text} />
        </Pressable>
        <View style={[styles.statusDot, { backgroundColor: status === 'open' ? colors.success : colors.textMuted }]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        {messages.isLoading ? <Loading /> : messages.isError ? <ErrorState error={messages.error} onRetry={() => void messages.refetch()} /> : (
          <FlatList
            data={items}
            inverted={items.length > 0}
            keyExtractor={(m) => m.clientId ?? String(m.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => messages.hasNextPage && !messages.isFetchingNextPage && messages.fetchNextPage()}
            onEndReachedThreshold={0.3}
            ListFooterComponent={messages.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.md }} /> : undefined}
            ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="Say hi 👋" message="Messages here are visible to everyone in the group." />}
          />
        )}
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
          />
          <Pressable onPress={submit} disabled={!draft.trim()} style={[styles.send, !draft.trim() && { opacity: 0.4 }]} accessibilityLabel="Send">
            <Icon name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <ActionSheet visible={!!menuFor} title={menuFor?.body ?? undefined} actions={menuFor ? menuActions(menuFor) : []} onClose={() => setMenuFor(null)} />
      <ReportSheet target={reportTarget} what="message" onClose={() => setReportTarget(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, flexGrow: 1 },
  day: { alignSelf: 'center', fontSize: 11, fontWeight: '600', color: colors.textSecondary, backgroundColor: colors.surfaceMuted, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, marginVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 2, gap: 6 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  avatarSlot: { width: 30 },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingTop: 7, paddingBottom: 5, borderRadius: 18 },
  mine: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6 },
  deletedBubble: { backgroundColor: colors.surfaceMuted, borderWidth: 0 },
  failed: { opacity: 0.6 },
  name: { fontSize: 12, fontWeight: '700', color: colors.primaryDark, marginBottom: 2 },
  body: { fontSize: 15, color: colors.text, lineHeight: 20 },
  deletedText: { fontStyle: 'italic', color: colors.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2 },
  time: { fontSize: 10, color: colors.textMuted },
  failedText: { alignSelf: 'flex-end', fontSize: 11, color: colors.danger, marginTop: 2, marginRight: 4 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, minHeight: 42, maxHeight: 120, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, borderRadius: 21, backgroundColor: colors.surfaceMuted, fontSize: 15, color: colors.text },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
