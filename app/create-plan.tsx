import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { usePlanStore } from '@/features/plans';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';

export default function CreatePlanScreen() {
  const router = useRouter();
  const { createPlan, isLoading: isLoadingPlan } = usePlanStore.getState();
  const { groups, fetchGroups } = useGroupStore.getState();

  const [title, setTitle] = React.useState('');
  const [time, setTime] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [participantLimit, setParticipantLimit] = React.useState('8');

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!title.trim() || !location.trim()) return;
    const groupId = groups.length > 0 ? groups[0].id : 'group_1';
    const plan = await createPlan({
      groupId,
      title,
      description: '',
      time,
      location,
      participantLimit: parseInt(participantLimit) || 4,
    });
    if (plan) {
      router.back();
    }
  };

  if (isLoadingPlan) {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Snack Plan</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="Evening Snack Run"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Time</Text>
          <TextInput
            placeholder="Today, 6:30 PM"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            placeholder="Campus Food Court"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />

          <Text style={styles.label}>Participant limit (optional)</Text>
          <View style={styles.limitRow}>
            <TextInput
              placeholder="8"
              value={participantLimit}
              onChangeText={setParticipantLimit}
              style={styles.limitInput}
              keyboardType="numeric"
            />
            <Text style={styles.limitSuffix}> /10</Text>
          </View>
        </View>

        <Button title="Create Plan" variant="primary" onPress={handleCreate} style={styles.createBtn} />
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 8,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
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
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  limitSuffix: {
    fontSize: 15,
    color: colors.textMuted,
    marginLeft: 8,
  },
  imageSection: {
    marginTop: 4,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  cameraIcon: {
    fontSize: 32,
  },
  imageText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  createBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
  },
});