import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePlanStore } from '@/features/plans';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';
import { SnackPlan } from '@/types';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, fetchPlans, isLoading: isLoadingPlans, joinPlan, leavePlan, error: planError } = usePlanStore.getState();
  const { groups } = useGroupStore.getState();

  const plan = plans.find((p) => p.id === id);
  const group = groups.find((g) => g.id === plan?.groupId);
  const isJoined = plan?.participantIds.includes('user_1') ?? false;
  const isFull = plan?.status === 'FULL' || (plan?.participantLimit && plan.participantIds.length >= plan.participantLimit);

  React.useEffect(() => {
    fetchPlans();
  }, [id, fetchPlans]);

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Plan not found</Text>
      </View>
    );
  }

  const isLoading = isLoadingPlans;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  }

  if (planError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{planError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planDesc}>{plan.description}</Text>
        <View style={styles.metaRow}>
          <Avatar size={32} name={group?.name || 'Organizer'} />
          <Text style={styles.metaText}>
            {new Date(plan.time).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })} at {new Date(plan.time).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaText}>{plan.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Limit</Text>
          <Text style={styles.metaText}>
            {plan.participantIds.length}/{plan.participantLimit}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isJoined ? (
          <Button title="Leave Plan" variant="outline" onPress={() => leavePlan(plan.id, 'user_1')} style={styles.btn} />
        ) : isFull ? (
          <Button title="Plan Full" disabled style={styles.btn} />
        ) : (
          <Button title="Join Plan" onPress={() => joinPlan(plan.id, 'user_1')} style={styles.btn} />
        )}
      </View>

      <View style={styles.participants}>
        <Text style={styles.sectionTitle}>Participants ({plan.participantIds.length})</Text>
        <View style={styles.participantList}>
          {plan.participantIds.map((pid) => (
            <Avatar key={pid} size={44} name={`User ${pid.slice(-1)}`} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  planDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 70,
  },
  metaText: {
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  btn: {
    backgroundColor: colors.primary,
  },
  participants: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  participantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  error: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});