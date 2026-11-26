import { router } from 'expo-router';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_LABEL } from '@/features/pickups';
import { usePlanAction } from '@/features/plans';
import { errorMessage } from '@/lib/api';
import { formatWhen, timeAgo, timeLeft } from '@/lib/format';
import type { FeedItem, PickupOffer, Plan, Poll } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';
import { AvatarStack } from './Avatar';
import { StatusBadge, TypeBadge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { ProgressBar } from './ProgressBar';

export function FeedCard({ item, showGroup = true }: { item: FeedItem; showGroup?: boolean }) {
  switch (item.type) {
    case 'PLAN': return <PlanCard plan={item.plan} showGroup={showGroup} />;
    case 'POLL': return <PollCard poll={item.poll} showGroup={showGroup} />;
    case 'PICKUP': return <PickupCard offer={item.pickup} showGroup={showGroup} />;
  }
}

function Meta({ type, createdAt, group }: { type: FeedItem['type']; createdAt: string; group?: string }) {
  return (
    <View style={styles.meta}>
      <TypeBadge type={type} />
      <Text style={font.tiny} numberOfLines={1}>
        {timeAgo(createdAt)}{group ? `  ·  ${group}` : ''}
      </Text>
    </View>
  );
}

function Line({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.line}>
      <Icon name={icon} size={14} color={colors.textMuted} />
      <Text style={font.small} numberOfLines={1}>{text}</Text>
    </View>
  );
}

export const PLAN_STATUS: Record<Plan['status'], { label: string; tone: 'neutral' | 'good' | 'warn' | 'bad' }> = {
  OPEN: { label: 'Open', tone: 'good' },
  FULL: { label: 'Full', tone: 'warn' },
  STARTED: { label: 'Happening now', tone: 'warn' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  CANCELLED: { label: 'Cancelled', tone: 'bad' },
};

export function PlanCard({ plan, showGroup }: { plan: Plan; showGroup?: boolean }) {
  const action = usePlanAction();
  const join = () => action.mutate({ id: plan.id, action: 'join' }, { onError: (e) => Alert.alert("Couldn't join", errorMessage(e)) });
  const going = plan.participantLimit ? `${plan.participantCount}/${plan.participantLimit} going` : `${plan.participantCount} going`;
  return (
    <Card onPress={() => router.push(`/plans/${plan.id}`)}>
      <Meta type="PLAN" createdAt={plan.createdAt} group={showGroup ? plan.group.name : undefined} />
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={font.subheading} numberOfLines={2}>{plan.title}</Text>
          {plan.description && <Text style={font.small} numberOfLines={1}>{plan.description}</Text>}
          <Line icon="time-outline" text={formatWhen(plan.startsAt)} />
          <Line icon="location-outline" text={plan.location} />
        </View>
        {plan.imageUrl && <Image source={{ uri: plan.imageUrl }} style={styles.thumb} />}
      </View>
      <View style={styles.footer}>
        <AvatarStack users={plan.participantsPreview} total={plan.participantCount} />
        <Text style={[font.small, { flex: 1 }]}>{going}</Text>
        {plan.joined ? (
          <StatusBadge label="You're going" tone="good" />
        ) : plan.status === 'OPEN' ? (
          <Button title="Join" size="sm" onPress={join} loading={action.isPending} />
        ) : (
          <StatusBadge {...PLAN_STATUS[plan.status]} />
        )}
      </View>
    </Card>
  );
}

export function PollCard({ poll, showGroup }: { poll: Poll; showGroup?: boolean }) {
  const top = [...poll.options].sort((a, b) => b.votes - a.votes).slice(0, 3);
  return (
    <Card onPress={() => router.push(`/polls/${poll.id}`)}>
      <Meta type="POLL" createdAt={poll.createdAt} group={showGroup ? poll.group.name : undefined} />
      <Text style={font.subheading}>{poll.question}</Text>
      <View style={{ gap: 8 }}>
        {(poll.totalVotes > 0 ? top : poll.options.slice(0, 3)).map((o) => (
          <View key={o.id} style={styles.optionRow}>
            <Text style={[font.small, styles.optionLabel, o.id === poll.myOptionId && { color: colors.poll, fontWeight: '700' }]} numberOfLines={1}>
              {o.label}
            </Text>
            <View style={{ flex: 1 }}><ProgressBar percent={o.percent} /></View>
            <Text style={[font.tiny, styles.percent]}>{o.percent}%</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <AvatarStack users={poll.votersPreview} total={poll.totalVotes} />
        <Text style={[font.small, { flex: 1 }]}>
          {poll.totalVotes} voted · {poll.status === 'ACTIVE' ? `ends ${timeLeft(poll.closesAt)}` : 'closed'}
        </Text>
        {poll.myOptionId == null && poll.status === 'ACTIVE' ? (
          <StatusBadge label="Vote" tone="warn" />
        ) : (
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
    </Card>
  );
}

export function PickupCard({ offer, showGroup }: { offer: PickupOffer; showGroup?: boolean }) {
  const open = offer.status === 'OPEN';
  return (
    <Card onPress={() => router.push(`/pickups/${offer.id}`)}>
      <Meta type="PICKUP" createdAt={offer.createdAt} group={showGroup ? offer.group.name : undefined} />
      <Text style={font.subheading}>
        {offer.creator.name} is heading to {offer.destination}
      </Text>
      {offer.note && <Text style={font.small} numberOfLines={2}>{offer.note}</Text>}
      <Line icon="time-outline" text={`${open ? 'Available until' : 'Was available until'} ${formatWhen(offer.availableUntil)}`} />
      <View style={styles.tags}>
        {offer.categories.map((c) => (
          <View key={c} style={styles.tag}><Text style={styles.tagText}>{CATEGORY_LABEL[c]}</Text></View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={[font.small, { flex: 1 }]}>
          {offer.requestCount} request{offer.requestCount === 1 ? '' : 's'}
          {offer.myOpenRequestCount > 0 ? ` · ${offer.myOpenRequestCount} yours` : ''}
        </Text>
        {open ? <StatusBadge label="Request" tone="warn" /> : <StatusBadge label={offer.status === 'CLOSED' ? 'Closed' : 'Cancelled'} />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  thumb: { width: 76, height: 76, borderRadius: radius.md },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionLabel: { width: 90, color: colors.text },
  percent: { width: 32, textAlign: 'right' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.pickupSoft },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.pickup },
});
