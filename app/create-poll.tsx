import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { usePollStore } from '@/features/polls';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';

export default function CreatePollScreen() {
  const router = useRouter();
  const { createPoll, isLoading: isLoadingPoll } = usePollStore.getState();
  const { groups, fetchGroups } = useGroupStore.getState();

  const [question, setQuestion] = React.useState('');
  const [option1, setOption1] = React.useState('');
  const [option2, setOption2] = React.useState('');
  const [option3, setOption3] = React.useState('');
  const [expiresAt, setExpiresAt] = React.useState('');

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!question.trim() || !option1.trim() || !option2.trim()) return;
    const groupId = groups.length > 0 ? groups[0].id : 'group_1';
    const poll = await createPoll({
      groupId,
      question,
      options: [
        { id: `opt_${Date.now()}_1`, text: option1, voteCount: 0, voterIds: [] },
        { id: `opt_${Date.now()}_2`, text: option2, voteCount: 0, voterIds: [] },
        ...(option3.trim() ? [{ id: `opt_${Date.now()}_3`, text: option3, voteCount: 0, voterIds: [] }] : []),
      ],
      expiresAt,
    });
    if (poll) {
      router.back();
    }
  };

  if (isLoadingPoll) {
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
          <Text style={styles.title}>Create Poll</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Question</Text>
          <TextInput
            placeholder="e.g. What should we eat for lunch?"
            value={question}
            onChangeText={setQuestion}
            style={styles.input}
          />

          <Text style={styles.label}>Options</Text>
          <TextInput
            placeholder="Option 1 (e.g. Sushi)"
            value={option1}
            onChangeText={setOption1}
            style={styles.input}
          />
          <TextInput
            placeholder="Option 2 (e.g. Burgers)"
            value={option2}
            onChangeText={setOption2}
            style={styles.input}
          />
          <TextInput
            placeholder="Option 3 (optional)"
            value={option3}
            onChangeText={setOption3}
            style={styles.input}
          />

          <Text style={styles.label}>Expires at (optional)</Text>
          <TextInput
            placeholder="e.g. 2026-11-30T22:00:00"
            value={expiresAt}
            onChangeText={setExpiresAt}
            style={styles.input}
          />
        </View>

        <Button title="Create Poll" variant="primary" onPress={handleCreate} style={styles.createBtn} />
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