import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReport, type ReportInput } from '@/features/safety';
import { ApiError, errorMessage } from '@/lib/api';
import type { ReportReason } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { TextField } from './TextField';

const REASONS: { value: ReportReason; label: string; hint: string }[] = [
  { value: 'HARASSMENT', label: 'Harassment or bullying', hint: 'Insults, threats, targeting someone' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content', hint: 'Sexual, violent or hateful content' },
  { value: 'SPAM', label: 'Spam or scam', hint: 'Ads, repeated messages, suspicious links' },
  { value: 'OTHER', label: 'Something else', hint: 'Tell the group owner what happened' },
];

export type ReportTargetInput = Omit<ReportInput, 'reason' | 'details'>;

/** Pick a reason, optionally add details, send. Reports go to the group owner and stay anonymous. */
export function ReportSheet({ target, what, onClose }: { target: ReportTargetInput | null; what: string; onClose: () => void }) {
  const report = useReport();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  const close = () => {
    setReason(null);
    setDetails('');
    onClose();
  };

  const submit = () => {
    if (!target || !reason) return;
    report.mutate({ ...target, reason, details: details.trim() || undefined }, {
      onSuccess: () => {
        close();
        Alert.alert('Thanks for reporting', "The group owner will review it. They won't see who reported it.");
      },
      onError: (e) => {
        if (e instanceof ApiError && e.code === 'ALREADY_REPORTED') {
          close();
          Alert.alert('Already reported', e.message);
        } else {
          Alert.alert("Couldn't send report", errorMessage(e));
        }
      },
    });
  };

  return (
    <Modal visible={!!target} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Text style={font.subheading}>Report {what}</Text>
          <Text style={font.small}>Why are you reporting this?</Text>
          {REASONS.map((r) => (
            <Pressable key={r.value} onPress={() => setReason(r.value)} style={[styles.reason, reason === r.value && styles.selected]}
              accessibilityRole="radio" accessibilityState={{ selected: reason === r.value }}>
              <View style={{ flex: 1 }}>
                <Text style={font.body}>{r.label}</Text>
                <Text style={font.tiny}>{r.hint}</Text>
              </View>
              {reason === r.value && <Icon name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          ))}
          {reason && (
            <TextField placeholder="Add details (optional)" value={details} onChangeText={setDetails} maxLength={500} multiline />
          )}
          <Button title="Send report" variant="danger" onPress={submit} disabled={!reason} loading={report.isPending} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  reason: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
});
