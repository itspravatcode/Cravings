import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore.getState();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorState, setErrorState] = React.useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      clearError();
      setErrorState('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      clearError();
      setErrorState('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password });
      router.replace('/');
    } catch {
      // Error already set by the store
    }
  };

  React.useEffect(() => {
    if (error) {
      setErrorState(error);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.burgerIcon}>
              <Text>🍔</Text>
            </View>
          </View>
          <Text style={styles.appName}>Cravings</Text>
          <Text style={styles.tagline}>Plan snacks, vote, and snack together!</Text>
        </View>

        {errorState && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorState}</Text>
          </View>
        )}

        <View style={styles.form}>
          <TextInput
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
            autoComplete="name"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            autoComplete="new-password"
          />
          <TextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
            autoComplete="new-password"
          />
          <Button
            title="Create an account"
            variant="primary"
            onPress={handleRegister}
            style={styles.registerBtn}
            loading={isLoading}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button title="Already have an account? Log in" variant="outline" onPress={() => router.push('/login')} style={styles.loginBtn} />

        <Text style={styles.footerText}>Works for both offices and colleges</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  burgerIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: '#fdecea',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  registerBtn: {
    width: '100%',
    backgroundColor: colors.secondary,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginBtn: {
    width: '100%',
    marginTop: 4,
  },
  footerText: {
    marginTop: 24,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});