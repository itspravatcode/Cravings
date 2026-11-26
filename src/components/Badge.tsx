import { StyleSheet, Text, View } from 'react-native';
import type { FeedType } from '@/lib/types';
import { colors, radius } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

export const TYPE_STYLE: Record<FeedType, { label: string; color: string; soft: string; icon: IconName }> = {
  PLAN: { label: 'Snack Plan', color: colors.plan, soft: colors.planSoft, icon: 'fast-food-outline' },
  POLL: { label: 'Poll', color: colors.poll, soft: colors.pollSoft, icon: 'bar-chart-outline' },
  PICKUP: { label: 'Pickup Offer', color: colors.pickup, soft: colors.pickupSoft, icon: 'bag-handle-outline' },
};

export function TypeBadge({ type }: { type: FeedType }) {
  const t = TYPE_STYLE[type];
  return (
    <View style={[styles.pill, { backgroundColor: t.soft }]}>
      <Icon name={t.icon} size={12} color={t.color} />
      <Text style={[styles.text, { color: t.color }]}>{t.label}</Text>
    </View>
  );
}

/** Neutral status label, e.g. "Full", "Closed", "Pending". */
export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const palette = {
    neutral: [colors.surfaceMuted, colors.textSecondary],
    good: [colors.planSoft, colors.plan],
    warn: [colors.primarySoft, colors.primaryDark],
    bad: [colors.dangerSoft, colors.danger],
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette[0] }]}>
      <Text style={[styles.text, { color: palette[1] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});
