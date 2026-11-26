import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useLogin } from '@/features/auth';
import { errorMessage } from '@/lib/api';
import { colors, spacing } from '@/lib/theme';

const schema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
});

export default function Login() {
  const login = useLogin();
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { identifier: '', password: '' } });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Screen back>
        <View style={styles.brand}>
          <Icon name="fast-food" size={48} color={colors.primary} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Plan snacks, vote, and snack together.</Text>
        </View>
        <Controller control={control} name="identifier" render={({ field }) => (
          <TextField icon="person-outline" placeholder="Email or username" autoCapitalize="none" autoComplete="username"
            value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.identifier?.message} />
        )} />
        <Controller control={control} name="password" render={({ field }) => (
          <TextField icon="lock-closed-outline" placeholder="Password" secure autoComplete="password"
            value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.password?.message}
            onSubmitEditing={() => void handleSubmit((v) => login.mutate(v))()} />
        )} />
        {login.isError && <Text style={styles.error}>{errorMessage(login.error)}</Text>}
        <Button title="Log in" loading={login.isPending} onPress={handleSubmit((v) => login.mutate(v))} />
        <Text style={styles.switch}>
          New to Cravings? <Link href="/register" replace style={styles.link}>Create an account</Link>
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: 6, marginVertical: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary },
  error: { color: colors.danger, textAlign: 'center' },
  switch: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.md },
  link: { color: colors.primaryDark, fontWeight: '700' },
});
