import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, spacing } from '@/lib/theme';
import { Icon } from './Icon';

type Props = {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  footer?: ReactNode;
  children: ReactNode;
};

/** Page shell: safe area, cream background, optional back header and sticky footer. */
export function Screen({ title, back, right, scroll = true, refreshControl, footer, children }: Props) {
  const header = (title || back || right) && (
    <View style={styles.header}>
      {back && (
        <Pressable hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button" accessibilityLabel="Go back">
          <Icon name="arrow-back" size={24} />
        </Pressable>
      )}
      <Text style={[styles.title, back && { fontSize: 20 }]} numberOfLines={1}>{title}</Text>
      {right}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { ...font.heading, fontSize: 24, flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xs, gap: spacing.md, paddingBottom: spacing.xxl },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.background },
});
