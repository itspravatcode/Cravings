import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AvatarStack } from '@/components/Avatar';
import { ReportSheet, type ReportTargetInput } from '@/components/ReportSheet';
import { StatusBadge, TypeBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/States';
import { useDeleteDraft, usePoll, usePollAction, useVote } from '@/features/polls';
import { errorMessage } from '@/lib/api';
import { formatWhen, timeLeft } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Id } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';

export default function PollDetails() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const me = useSession((s) => s.user);
  const poll = usePoll(id);
  const vote = useVote();
  const action = usePollAction();
  const del = useDeleteDraft();
  const [picked, setSelected] = useState<Id | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTargetInput | null>(null);
  // Until the user taps an option, their existing vote is the selection.
  const selected = picked ?? poll.data?.myOptionId ?? null;

  if (poll.isLoading) return <Screen back><Loading /></Screen>;
  if (!poll.data) return <Screen back><ErrorState error={poll.error} onRetry={poll.refetch} /></Screen>;
  const p = poll.data;
  const isCreator = p.creator.id === me?.id;
  const active = p.status === 'ACTIVE';
  const canVote = active && (p.myOptionId == null || p.allowVoteChange);
  const fail = (e: unknown) => Alert.alert('Something went wrong', errorMessage(e));

  let footer: React.ReactNode = null;
  if (p.status === 'DRAFT') {
    footer = (
      <View style={{ gap: spacing.sm }}>
        <Button title="Publish poll" onPress={() => action.mutate({ id, action: 'publish' }, { onError: fail })} loading={action.isPending} />
        <Button title="Delete draft" variant="ghost" size="sm" onPress={() => del.mutate(id, { onSuccess: () => router.back(), onError: fail })} />
      </View>
    );
  } else if (canVote) {
    footer = (
      <Button title={p.myOptionId == null ? 'Submit vote' : 'Change vote'} loading={vote.isPending}
        disabled={selected == null || selected === p.myOptionId}
        onPress={() => selected != null && vote.mutate({ pollId: id, optionId: selected }, { onError: fail })} />
    );
  }

  const closeEarly = () => Alert.alert('Close voting now?', 'The current leader becomes the winner.', [
    { text: 'Not yet', style: 'cancel' }, { text: 'Close poll', onPress: () => action.mutate({ id, action: 'close' }, { onError: fail }) },
  ]);

  return (
    <Screen back title="Poll" footer={footer}
      right={isCreator && active ? <Pressable onPress={closeEarly} hitSlop={10} accessibilityLabel="Close poll"><Icon name="stop-circle-outline" size={24} /></Pressable>
        : !isCreator ? <Pressable onPress={() => setReportTarget({ targetType: 'POLL', targetId: id })} hitSlop={10} accessibilityLabel="Report poll"><Icon name="flag-outline" size={22} /></Pressable> : undefined}>
      <View style={styles.badges}>
        <TypeBadge type="POLL" />
        {p.status === 'DRAFT' && <StatusBadge label="Draft · only you can see this" />}
        {p.status === 'CLOSED' && <StatusBadge label="Closed" />}
      </View>
      <Text style={font.title}>{p.question}</Text>
      <Text style={font.small}>
        {p.group.name} · {active ? `Choose your favorite · ends ${timeLeft(p.closesAt)}` : p.status === 'CLOSED' ? `Closed ${formatWhen(p.closesAt)}` : `Closes ${formatWhen(p.closesAt)}`}
      </Text>
      <View style={{ gap: spacing.sm }}>
        {p.options.map((o) => {
          const isSelected = selected === o.id;
          return (
            <Pressable key={o.id} disabled={!canVote} onPress={() => setSelected(o.id)}
              accessibilityRole="radio" accessibilityState={{ selected: isSelected }}
              style={[styles.option, isSelected && styles.optionSelected, o.winner && styles.winner]}>
              <View style={styles.optionTop}>
                {canVote && <View style={[styles.radio, isSelected && styles.radioOn]}>{isSelected && <View style={styles.radioDot} />}</View>}
                <Text style={[font.body, { flex: 1, fontWeight: '600' }]}>{o.label}</Text>
                {o.winner && <Icon name="trophy" size={16} color={colors.primary} />}
                {o.id === p.myOptionId && <StatusBadge label="Your vote" tone="good" />}
                <Text style={font.small}>{o.votes} vote{o.votes === 1 ? '' : 's'}</Text>
              </View>
              <View style={styles.optionBar}>
                <View style={{ flex: 1 }}><ProgressBar percent={o.percent} color={o.winner ? colors.primary : colors.primary} /></View>
                <Text style={[font.tiny, { width: 36, textAlign: 'right' }]}>{o.percent}%</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.voters}>
        <AvatarStack users={p.votersPreview} total={p.totalVotes} />
        <Text style={font.small}>{p.totalVotes} voted{!p.allowVoteChange && active ? ' · votes are final' : ''}</Text>
      </View>
      <ReportSheet target={reportTarget} what="poll" onClose={() => setReportTarget(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  option: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, gap: spacing.sm },
  optionSelected: { borderColor: colors.primary },
  winner: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  optionTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  voters: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
