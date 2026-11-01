import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useAuthStore } from '@/features/auth';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore.getState();

  const handleLogout = async () => {
    await logout();
    router.replace('/splash');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Avatar
            size={80}
            name={user?.name || 'Alex'}
            src={user?.avatarUrl}
            style={styles.avatarOuter}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Alex'}</Text>
          <Text style={styles.profileTagline}>Good food. Good mood.</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreText}>…</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Plans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Total Votes</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => router.push('/groups')} style={styles.menuItem}>
          <Text style={styles.menuText}>My Groups</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/create')} style={styles.menuItem}>
          <Text style={styles.menuText}>My Plans</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/create')} style={styles.menuItem}>
          <Text style={styles.menuText}>My Polls</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/create')} style={styles.menuItem}>
          <Text style={styles.menuText}>My Pickups</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Button title="Sign Out" variant="outline" onPress={handleLogout} style={styles.signoutBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 24,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: colors.text,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  profileTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  moreBtn: {
    padding: 8,
  },
  moreText: {
    fontSize: 20,
    color: colors.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  menuContainer: {
    gap: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  chevron: {
    fontSize: 16,
    color: colors.textMuted,
  },
  signoutBtn: {
    marginTop: 16,
    backgroundColor: colors.danger,
  },
});