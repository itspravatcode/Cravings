import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Linking, Pressable, StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useRegister } from '@/features/auth';
import { ApiError, errorMessage, LEGAL_URLS } from '@/lib/api';
import { colors, spacing } from '@/lib/theme';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  username: z.string().trim().regex(/^[a-zA-Z0-9_.]{3,30}$/, '3–30 letters, numbers, _ or .'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(72),
  avatarUrl: z.union([z.literal(''), z.url('Must be a link starting with http(s)://')]),
  acceptTerms: z.boolean().refine((v) => v, 'Please accept the Terms and Privacy Policy'),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export default function Register() {
  const register = useRegister();
  const { control, handleSubmit, setError, formState: { errors } } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', username: '', email: '', password: '', avatarUrl: '', acceptTerms: false },
  });

  const submit = handleSubmit((v) =>
    register.mutate({ ...v, avatarUrl: v.avatarUrl || undefined }, {
      onError: (e) => {
        if (e instanceof ApiError && e.code === 'EMAIL_TAKEN') setError('email', { message: e.message });
        if (e instanceof ApiError && e.code === 'USERNAME_TAKEN') setError('username', { message: e.message });
        if (e instanceof ApiError) Object.entries(e.fieldErrors).forEach(([k, m]) => setError(k as keyof Values, { message: m }));
      },
    }),
  );

  const field = (name: Exclude<keyof Values, 'acceptTerms'>, props: React.ComponentProps<typeof TextField>) => (
    <Controller control={control} name={name} render={({ field: f }) => (
      <TextField value={f.value} onChangeText={f.onChange} onBlur={f.onBlur} error={errors[name]?.message} {...props} />
    )} />
  );

  const generic = register.isError && !(register.error instanceof ApiError && ['EMAIL_TAKEN', 'USERNAME_TAKEN', 'VALIDATION_FAILED'].includes(register.error.code));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Screen back title="Create account">
        <Text style={styles.subtitle}>Join your office, class or friends and start planning snack breaks.</Text>
        {field('name', { label: 'Full name', icon: 'person-outline', placeholder: 'Alex Kumar', autoComplete: 'name' })}
        {field('username', { label: 'Username', icon: 'at-outline', placeholder: 'alex', autoCapitalize: 'none' })}
        {field('email', { label: 'Email', icon: 'mail-outline', placeholder: 'you@example.com', autoCapitalize: 'none', keyboardType: 'email-address', autoComplete: 'email' })}
        {field('password', { label: 'Password', icon: 'lock-closed-outline', placeholder: 'At least 8 characters', secure: true, autoComplete: 'new-password' })}
        {field('avatarUrl', { label: 'Profile picture', hint: '(optional link)', icon: 'image-outline', placeholder: 'https://…', autoCapitalize: 'none', keyboardType: 'url' })}
        <Controller control={control} name="acceptTerms" render={({ field: f }) => (
          <Pressable onPress={() => f.onChange(!f.value)} style={styles.terms} accessibilityRole="checkbox" accessibilityState={{ checked: !!f.value }}>
            <Icon name={f.value ? 'checkbox' : 'square-outline'} size={22} color={f.value ? colors.primary : colors.textMuted} />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.link} onPress={() => void Linking.openURL(LEGAL_URLS.terms)}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.link} onPress={() => void Linking.openURL(LEGAL_URLS.privacy)}>Privacy Policy</Text>,
              including the community rules.
            </Text>
          </Pressable>
        )} />
        {errors.acceptTerms && <Text style={[styles.error, { textAlign: 'left' }]}>{errors.acceptTerms.message}</Text>}
        {generic && <Text style={styles.error}>{errorMessage(register.error)}</Text>}
        <Button title="Create account" loading={register.isPending} onPress={submit} style={{ marginTop: spacing.sm }} />
        <Text style={styles.switch}>
          Already have an account? <Link href="/login" replace style={styles.link}>Log in</Link>
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.sm },
  error: { color: colors.danger, textAlign: 'center' },
  switch: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.md },
  link: { color: colors.primaryDark, fontWeight: '700' },
  terms: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  termsText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
});
