import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  right?: ReactNode;
  secure?: boolean;
};

export function TextField({ label, hint, error, icon, right, secure, style, multiline, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && (
        <Text style={styles.label}>
          {label} {hint && <Text style={styles.hint}>{hint}</Text>}
        </Text>
      )}
      <View style={[styles.box, multiline && styles.multiline, focused && styles.focused, !!error && styles.errorBox]}>
        {icon && <Icon name={icon} size={18} color={colors.textMuted} />}
        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && hidden}
          multiline={multiline}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={[styles.input, multiline && { minHeight: 72, textAlignVertical: 'top' }, style]}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
        {right}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  hint: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  box: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 50, paddingHorizontal: 14,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: 12 },
  focused: { borderColor: colors.primary },
  errorBox: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
  error: { fontSize: 12, color: colors.danger },
});
