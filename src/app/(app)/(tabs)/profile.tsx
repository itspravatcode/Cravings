import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { signOut, useMe, useStats } from '@/features/auth';
import { LEGAL_URLS } from '@/lib/api';
import { useSession } from '@/lib/session';
import { colors, font, spacing } from '@/lib/theme';

const LINKS: { label: string; icon: IconName; href: Href }[] = [
  { label: 'My Groups', icon: 'people-outline', href: '/groups' },
  { label: 'My Plans', icon: 'fast-food-outline', href: '/me/plans' },
  { label: 'My Polls', icon: 'bar-chart-outline', href: '/me/polls' },
  { label: 'My Pickup Offers', icon: 'bag-handle-outline', href: '/me/pickup-offers' },
  { label: 'My Pickup Requests', icon: 'bag-check-outline', href: '/me/pickup-requests' },
];

export default function Profile() {
  const cached = useSession((s) => s.user);
  const me = useMe();
  const stats = useStats();
  const { refetch: refetchOnFocus } = stats;
  useFocusEffect(useCallback(() => { void refetchOnFocus(); }, [refetchOnFocus]));
  const user = me.data ?? cached;

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You can log back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);

  return (
    <Screen
      right={<Pressable onPress={() => router.push('/me/edit')} hitSlop={10} accessibilityLabel="Settings"><Icon name="settings-outline" size={22} /></Pressable>}
    >
      {user && (
        <View style={styles.head}>
          <Avatar user={user} size={96} />
          <Text style={font.heading}>{user.name}</Text>
          <Text style={font.small}>@{user.username}</Text>
        </View>
      )}
      <View style={styles.stats}>
        {[
          ['Groups', stats.data?.groups],
          ['Plans joined', stats.data?.plansJoined],
          ['Votes', stats.data?.pollsVoted],
          ['Pickups', stats.data ? stats.data.pickupOffers + stats.data.pickupRequests : undefined],
        ].map(([label, n]) => (
          <View key={label as string} style={styles.stat}>
            <Text style={styles.statNum}>{n ?? '–'}</Text>
            <Text style={font.tiny}>{label}</Text>
          </View>
        ))}
      </View>
      <Card style={{ paddingVertical: spacing.xs, gap: 0 }}>
        {LINKS.map((l, i) => (
          <Pressable key={l.label} onPress={() => router.push(l.href)} style={[styles.link, i > 0 && styles.divider]}>
            <Icon name={l.icon} size={20} color={colors.textSecondary} />
            <Text style={[font.body, { flex: 1 }]}>{l.label}</Text>
            <Icon name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>
      <Card style={{ paddingVertical: spacing.xs, gap: 0 }}>
        <Pressable onPress={() => router.push('/me/notifications')} style={styles.link}>
          <Icon name="notifications-outline" size={20} color={colors.textSecondary} />
          <Text style={[font.body, { flex: 1 }]}>Notifications</Text>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => router.push('/me/edit')} style={[styles.link, styles.divider]}>
          <Icon name="create-outline" size={20} color={colors.textSecondary} />
          <Text style={[font.body, { flex: 1 }]}>Edit profile & settings</Text>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => router.push('/me/blocked')} style={[styles.link, styles.divider]}>
          <Icon name="ban-outline" size={20} color={colors.textSecondary} />
          <Text style={[font.body, { flex: 1 }]}>Blocked people</Text>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => void Linking.openURL(LEGAL_URLS.terms)} style={[styles.link, styles.divider]}>
          <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
          <Text style={[font.body, { flex: 1 }]}>Terms of Service</Text>
          <Icon name="open-outline" size={16} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => void Linking.openURL(LEGAL_URLS.privacy)} style={[styles.link, styles.divider]}>
          <Icon name="lock-closed-outline" size={20} color={colors.textSecondary} />
          <Text style={[font.body, { flex: 1 }]}>Privacy Policy</Text>
          <Icon name="open-outline" size={16} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={confirmLogout} style={[styles.link, styles.divider]}>
          <Icon name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[font.body, { flex: 1, color: colors.danger }]}>Log out</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md },
  stat: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.text },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
