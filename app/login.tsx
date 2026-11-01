import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore.getState();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorState, setErrorState] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (error) {
      setErrorState(error);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      clearError();
      setErrorState('Please enter both email and password');
      return;
    }

    try {
      await login({ email, password });
      router.replace('/');
    } catch {
      // Error already set by the store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.burgerIcon}><Text style={styles.burgerIconText}>🍔</Text></View>
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
            placeholder="Email or username"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>
          <Button title="Log In" variant="primary" onPress={handleLogin} style={styles.loginBtn} loading={isLoading} />
        </View>

        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button title="Create an account" variant="outline" onPress={() => router.push('/register')} style={styles.registerBtn} />

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
    marginBottom: 40,
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
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -1,
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
    backgroundColor: colors.inputBg,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  passwordWrapper: {
    width: '100%',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  forgotContainer: {
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  burgerIconText: {
    fontSize: 64,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
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
  registerBtn: {
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
