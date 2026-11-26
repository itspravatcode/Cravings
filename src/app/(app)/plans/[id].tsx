import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { ReportSheet, type ReportTargetInput } from '@/components/ReportSheet';
import { StatusBadge, TypeBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PLAN_STATUS } from '@/components/FeedCards';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/States';
import { useParticipants, usePlan, usePlanAction } from '@/features/plans';
import { errorMessage } from '@/lib/api';
import { formatWhen, timeAgo } from '@/lib/format';
import { useSession } from '@/lib/session';
import { colors, font, radius, spacing } from '@/lib/theme';

export default function PlanDetails() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const me = useSession((s) => s.user);
  const plan = usePlan(id);
  const participants = useParticipants(id);
  const action = usePlanAction();
  const [reportTarget, setReportTarget] = useState<ReportTargetInput | null>(null);

  if (plan.isLoading) return <Screen back><Loading /></Screen>;
  if (!plan.data) return <Screen back><ErrorState error={plan.error} onRetry={plan.refetch} /></Screen>;
  const p = plan.data;
  const isCreator = p.creator.id === me?.id;
  const editable = isCreator && (p.status === 'OPEN' || p.status === 'FULL');

  const run = (a: 'join' | 'leave' | 'cancel') => action.mutate({ id, action: a }, { onError: (e) => Alert.alert('Something went wrong', errorMessage(e)) });
  const cancel = () => Alert.alert('Cancel this plan?', 'Everyone who joined will be notified.', [
    { text: 'Keep it', style: 'cancel' }, { text: 'Cancel plan', style: 'destructive', onPress: () => run('cancel') },
  ]);

  let footer: React.ReactNode = null;
  if (!isCreator && p.joined && p.status !== 'COMPLETED' && p.status !== 'CANCELLED') {
    footer = <Button title="Leave plan" variant="danger" onPress={() => run('leave')} loading={action.isPending} />;
  } else if (!p.joined && p.status === 'OPEN') {
    footer = <Button title="Join plan" onPress={() => run('join')} loading={action.isPending} />;
  } else if (editable) {
    footer = <Button title="Cancel plan" variant="danger" onPress={cancel} loading={action.isPending} />;
  }

  return (
    <Screen back title="Snack Plan" footer={footer}
      right={editable ? <Pressable onPress={() => router.push(`/plans/new?edit=${id}`)} hitSlop={10} accessibilityLabel="Edit plan"><Icon name="create-outline" size={22} /></Pressable>
        : !isCreator ? <Pressable onPress={() => setReportTarget({ targetType: 'PLAN', targetId: id })} hitSlop={10} accessibilityLabel="Report plan"><Icon name="flag-outline" size={22} /></Pressable> : undefined}>
      {p.imageUrl && <Image source={{ uri: p.imageUrl }} style={styles.image} />}
      <View style={styles.badges}>
        <TypeBadge type="PLAN" />
        <StatusBadge {...PLAN_STATUS[p.status]} />
      </View>
      <Text style={font.title}>{p.title}</Text>
      {p.description && <Text style={[font.body, { color: colors.textSecondary }]}>{p.description}</Text>}
      <Card style={{ gap: spacing.md }}>
        <Row icon="time-outline" label="When" value={formatWhen(p.startsAt)} />
        <Row icon="location-outline" label="Where" value={p.location} />
        <Row icon="people-outline" label="Going" value={p.participantLimit ? `${p.participantCount} of ${p.participantLimit}` : `${p.participantCount}`} />
        <Row icon="people-circle-outline" label="Group" value={p.group.name} onPress={() => router.push(`/groups/${p.group.id}`)} />
      </Card>
      <Text style={font.subheading}>Participants</Text>
      <Card style={{ gap: spacing.md }}>
        {(participants.data ?? p.participantsPreview).map((u) => (
          <View key={u.id} style={styles.person}>
            <Avatar user={u} />
            <Text style={[font.body, { flex: 1 }]}>{u.name}{u.id === me?.id ? ' (you)' : ''}</Text>
            {u.id === p.creator.id && <StatusBadge label="Host" tone="warn" />}
          </View>
        ))}
      </Card>
      <Text style={[font.tiny, { textAlign: 'center' }]}>Created by {p.creator.name} · {timeAgo(p.createdAt)}</Text>
      <ReportSheet target={reportTarget} what="plan" onClose={() => setReportTarget(null)} />
    </Screen>
  );
}

function Row({ icon, label, value, onPress }: { icon: React.ComponentProps<typeof Icon>['name']; label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <View style={styles.rowIcon}><Icon name={icon} size={18} color={colors.primaryDark} /></View>
      <View style={{ flex: 1 }}>
        <Text style={font.tiny}>{label}</Text>
        <Text style={font.body}>{value}</Text>
      </View>
      {onPress && <Icon name="chevron-forward" size={16} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, borderRadius: radius.lg },
  badges: { flexDirection: 'row', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
