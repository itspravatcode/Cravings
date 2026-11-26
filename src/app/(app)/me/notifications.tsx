import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Loading } from '@/components/States';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/features/notifications';
import { registerForPush, type PushStatus } from '@/lib/push';
import type { NotificationSettings } from '@/lib/types';
import { colors, font, spacing } from '@/lib/theme';

const ROWS: { key: keyof NotificationSettings; label: string; hint: string; icon: IconName }[] = [
  { key: 'chat', label: 'Group chat', hint: 'New messages while the app is closed. Mute single groups from their chat.', icon: 'chatbubbles-outline' },
  { key: 'plans', label: 'Snack plans', hint: 'New plans, people joining or leaving yours, changes and cancellations.', icon: 'fast-food-outline' },
  { key: 'polls', label: 'Polls', hint: 'New polls, closing-soon reminders and results.', icon: 'bar-chart-outline' },
  { key: 'pickups', label: 'Pickups', hint: 'People heading out, and updates on your requests.', icon: 'bag-handle-outline' },
  { key: 'groups', label: 'Groups', hint: 'Invites, join requests and approvals.', icon: 'people-outline' },
];

const STATUS_TEXT: Record<Exclude<PushStatus, 'enabled'>, string> = {
  denied: 'Notifications are turned off for Cravings in your phone settings.',
  unsupported: 'Push notifications need a real phone. Simulators and some emulators can’t receive them.',
  'no-project': 'This build isn’t linked to an Expo project yet, so push is unavailable. (Developer: run `eas init`.)',
  unavailable: 'Push isn’t available in this build. On Android, Expo Go can’t receive push. Use a development or store build.',
};

export default function NotificationSettingsScreen() {
  const settings = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const [status, setStatus] = useState<PushStatus | null>(null);

  // Re-check when coming back from system settings.
  useFocusEffect(useCallback(() => {
    void registerForPush(false).then(setStatus);
  }, []));

  return (
    <Screen back title="Notifications">
      {status && status !== 'enabled' && (
        <Card style={styles.banner}>
          <View style={styles.row}>
            <Icon name="notifications-off-outline" size={20} color={colors.primaryDark} />
            <Text style={[font.small, { flex: 1, color: colors.text }]}>{STATUS_TEXT[status]}</Text>
          </View>
          {status === 'denied' && <Button title="Open phone settings" size="sm" variant="secondary" onPress={() => void Linking.openSettings()} />}
        </Card>
      )}
      <Text style={font.small}>Choose what reaches your phone. Everything still shows up in Activity.</Text>
      {settings.isLoading || !settings.data ? <Loading /> : (
        <Card style={{ gap: 0, paddingVertical: spacing.xs }}>
          {ROWS.map((r, i) => (
            <View key={r.key} style={[styles.row, styles.item, i > 0 && styles.divider]}>
              <Icon name={r.icon} size={20} color={colors.textSecondary} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={font.body}>{r.label}</Text>
                <Text style={font.tiny}>{r.hint}</Text>
              </View>
              <Switch
                value={settings.data![r.key]}
                onValueChange={(v) => update.mutate({ [r.key]: v })}
                trackColor={{ true: colors.primary }}
                accessibilityLabel={r.label}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  item: { paddingVertical: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
