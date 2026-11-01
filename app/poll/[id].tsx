import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePollStore } from '@/features/polls';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';
import { Poll } from '@/types';

export default function PollScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { polls, fetchPolls, isLoading: isLoadingPolls, votePoll } = usePollStore.getState();
  const { groups, fetchGroups } = useGroupStore.getState();

  const poll = polls.find((p) => p.id === id);
  const group = poll ? groups.find((g) => g.id === poll.groupId) : null;
  const hasVoted = poll?.userVote != null;
  const isLoading = isLoadingPolls;

  React.useEffect(() => {
    fetchPolls('group_1');
    fetchGroups();
  }, [id, fetchPolls, fetchGroups]);

  if (!poll) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>Poll not found</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  }

  const total = poll.options.reduce((a, b) => a + b.voteCount, 0);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Poll</Text>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuText}>…</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{poll.question}</Text>
        <Text style={styles.questionSub}>Choose your favorite option</Text>

        {poll.options.map((option) => {
          const percent = total ? Math.round((option.voteCount / total) * 100) : 0;
          const isSelected = option.id === poll.userVote;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
            >
              <TouchableOpacity
                style={[styles.radio, isSelected && styles.radioSelected]}
                onPress={() => votePoll(poll.id, option.id, 'user_1')}
              />
              <View style={styles.optionInfo}>
                <Text style={styles.optionText}>{option.text}</Text>
                <Text style={styles.optionMeta}>{option.voteCount} votes</Text>
              </View>
              <View style={styles.optionStats}>
                <Text style={styles.percent}>{percent}%</Text>
                <View style={[styles.barTrack, { width: '60%' }]}>
                  <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: isSelected ? colors.primary : '#E2E8F0' }]} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.endsRow}>
          <Text style={styles.endsLabel}>Ends in 2 hours</Text>
        </View>
      </View>

      <Button
        title="Submit Vote"
        variant="primary"
        onPress={() => votePoll(poll.id, poll.options.find((o) => o.id === poll.userVote)?.id || '', 'user_1')}
        style={styles.voteBtn}
        disabled={hasVoted}
      />
    </ScrollView>
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
    justifyContent: 'space-between',
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
  menuBtn: {
    padding: 8,
  },
  menuText: {
    fontSize: 22,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  question: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  questionSub: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  optionRowSelected: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  optionInfo: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  optionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    minWidth: 30,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  endsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  endsLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  voteBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
  },
  error: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});