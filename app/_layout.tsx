import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/features/auth';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Keep the hook order stable across renders: always call hooks
  // unconditionally, then do conditional rendering. Skipping a hook call
  // (e.g. returning early before useEffect) triggers
  // "Rendered fewer hooks than expected" in React 19.
  React.useEffect(() => {
    // While auth is still hydrating, don't redirect yet.
    if (isLoading) {
      return;
    }
    // Redirect unauthenticated users to the splash screen (→ login).
    if (!isAuthenticated) {
      router.replace('/splash');
    }
  }, [isLoading, isAuthenticated, router]);

  // While auth state is being hydrated from storage, show a splash screen.
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={styles.splashContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <QueryClientProvider client={queryClient}>
        <Stack />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
  },
});