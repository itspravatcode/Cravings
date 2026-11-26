import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { TYPE_STYLE } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { colors, font, spacing } from '@/lib/theme';

const OPTIONS: { href: Href; title: string; text: string; icon: IconName; color: string; soft: string }[] = [
  { href: '/plans/new', title: 'Snack Plan', text: 'Plan a snack break with time, location and participants.', icon: 'fast-food-outline', color: TYPE_STYLE.PLAN.color, soft: TYPE_STYLE.PLAN.soft },
  { href: '/polls/new', title: 'Poll', text: 'Let your group vote on what to eat or do.', icon: 'bar-chart', color: TYPE_STYLE.POLL.color, soft: TYPE_STYLE.POLL.soft },
  { href: '/pickups/new', title: 'Pickup Offer', text: 'Heading out? Let others request items.', icon: 'bag-handle-outline', color: TYPE_STYLE.PICKUP.color, soft: TYPE_STYLE.PICKUP.soft },
  { href: '/groups/new', title: 'Group', text: 'Start a private group for your office, class or friends.', icon: 'people-outline', color: colors.primary, soft: colors.primarySoft },
];

export default function Create() {
  return (
    <Screen title="Create">
      <Text style={[font.body, { color: colors.textSecondary, marginBottom: spacing.sm }]}>What do you want to create?</Text>
      {OPTIONS.map((o) => (
        <Card key={o.title} onPress={() => router.push(o.href)} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: o.soft }]}><Icon name={o.icon} size={28} color={o.color} /></View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={font.subheading}>{o.title}</Text>
            <Text style={font.small}>{o.text}</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  icon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
