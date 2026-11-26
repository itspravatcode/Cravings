import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { errorMessage } from '@/lib/api';
import { colors, font, spacing } from '@/lib/theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Icon name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.title}>{"Couldn't load this"}</Text>
      <Text style={styles.message}>{errorMessage(error)}</Text>
      {onRetry && <Button title="Try again" variant="secondary" size="sm" onPress={onRetry} />}
    </View>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: IconName; title: string; message?: string; action?: ReactNode }) {
  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm, minHeight: 240 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { ...font.subheading, textAlign: 'center' },
  message: { ...font.small, textAlign: 'center', marginBottom: spacing.sm },
});
