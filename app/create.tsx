import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';

type CreateOption = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  route: string;
};

const CREATE_OPTIONS: CreateOption[] = [
  {
    id: 'snack-plan',
    title: 'Snack Plan',
    subtitle: 'Plan a snack break with time, location & participants',
    icon: '🍽️',
    bgColor: '#E8F5E9',
    route: '/create-plan',
  },
  {
    id: 'poll',
    title: 'Poll',
    subtitle: "Let your group vote on what to eat or do",
    icon: '🗳️',
    bgColor: '#F3E8FF',
    route: '/create-poll',
  },
  {
    id: 'pickup-offer',
    title: 'Pickup Offer',
    subtitle: "Heading out? Let others request items",
    icon: '🛒',
    bgColor: '#FEF3C7',
    route: '/create-pickup',
  },
];

export default function CreateScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create</Text>
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>What do you want to create?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {CREATE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => router.push(option.route)}
            style={styles.optionCard}
          >
            <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
              <Text style={styles.optionIconText}>{option.icon}</Text>
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 8,
  },
  subtitleContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconText: {
    fontSize: 28,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
});