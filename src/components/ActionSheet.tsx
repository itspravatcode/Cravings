import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

export type SheetAction = { label: string; icon?: IconName; destructive?: boolean; onPress: () => void };

/** Bottom sheet of actions. Used instead of Alert because Android alerts show at most three buttons. */
export function ActionSheet({ visible, title, actions, onClose }: {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        {title && <Text style={styles.title} numberOfLines={2}>{title}</Text>}
        {actions.map((a) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}
            onPress={() => { onClose(); a.onPress(); }}
            accessibilityRole="button"
          >
            {a.icon && <Icon name={a.icon} size={20} color={a.destructive ? colors.danger : colors.text} />}
            <Text style={[styles.label, a.destructive && { color: colors.danger }]}>{a.label}</Text>
          </Pressable>
        ))}
        <Pressable style={[styles.row, styles.cancel]} onPress={onClose} accessibilityRole="button">
          <Text style={[styles.label, { color: colors.textSecondary, textAlign: 'center', flex: 1 }]}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.md, paddingHorizontal: spacing.sm },
  title: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 15, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  label: { fontSize: 16, color: colors.text, fontWeight: '500' },
  cancel: { marginTop: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, borderRadius: 0 },
});
