import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { colors } from '@/theme/colors';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore.getState();

  React.useEffect(() => {
    // Go straight to the right place based on auth state.
    if (isAuthenticated) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.appName}>Cravings</Text>
      <Text style={styles.tagline}>Good snacks. Better company.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
