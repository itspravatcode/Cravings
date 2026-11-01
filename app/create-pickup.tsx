import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { usePickupStore } from '@/features/pickups';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';

export default function CreatePickupScreen() {
  const router = useRouter();
  const { createPickup, isLoading: isLoadingPickup } = usePickupStore.getState();
  const { groups, fetchGroups } = useGroupStore.getState();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!title.trim() || !location.trim()) return;
    const groupId = groups.length > 0 ? groups[0].id : 'group_1';
    const offer = await createPickup({
      groupId,
      title,
      description,
      location,
      items: [],
      time: new Date(Date.now() + 3600000).toISOString(),
    });
    if (offer) {
      router.back();
    }
  };

  if (isLoadingPickup) {
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
          <Text style={styles.title}>Create Pickup Offer</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="e.g. Grocery Run"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="e.g. Snacks, drinks, and chips. Anyone need anything?"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            placeholder="e.g. Main Street (near office)"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
        </View>

        <Button title="Create Pickup Offer" variant="primary" onPress={handleCreate} style={styles.createBtn} />
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
    gap: 16,
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
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
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  createBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
  },
});