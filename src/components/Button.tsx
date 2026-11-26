import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: '#fff' },
  secondary: { bg: colors.primarySoft, fg: colors.primaryDark },
  outline: { bg: 'transparent', fg: colors.primaryDark, border: colors.primary },
  ghost: { bg: 'transparent', fg: colors.textSecondary },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style }: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: v.bg, borderColor: v.border ?? 'transparent', opacity: inactive ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} color={v.fg} />}
          <Text style={[styles.text, { color: v.fg, fontSize: size === 'sm' ? 13 : 15 }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  md: { minHeight: 50, paddingHorizontal: 20 },
  sm: { minHeight: 34, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontWeight: '700' },
});
