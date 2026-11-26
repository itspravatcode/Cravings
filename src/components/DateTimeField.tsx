import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatWhen } from '@/lib/format';
import { colors, radius, spacing } from '@/lib/theme';
import { Button } from './Button';
import { Chip } from './Chip';
import { Icon } from './Icon';

export type Preset = { label: string; at: () => Date };

const inMinutes = (m: number) => () => new Date(Date.now() + m * 60_000);
const todayAt = (h: number) => () => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
};

export const PRESETS = {
  soon: [
    { label: 'In 30 min', at: inMinutes(30) },
    { label: 'In 1 hour', at: inMinutes(60) },
    { label: '1 PM', at: todayAt(13) },
    { label: '6:30 PM', at: () => { const d = todayAt(18)(); d.setMinutes(30); return d; } },
  ],
  duration: [
    { label: '30 min', at: inMinutes(30) },
    { label: '1 hour', at: inMinutes(60) },
    { label: '2 hours', at: inMinutes(120) },
    { label: 'Tonight', at: todayAt(21) },
  ],
} satisfies Record<string, Preset[]>;

type Props = {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  presets?: Preset[];
  /** Latest selectable time, as milliseconds from when the picker opens. */
  maxAheadMs?: number;
  error?: string;
};

/** Quick presets plus the native picker (Android: date then time dialogs; iOS: datetime wheel in a sheet). */
export function DateTimeField({ label, value, onChange, presets = PRESETS.soon, maxAheadMs, error }: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(null);
  const [bounds, setBounds] = useState<{ min: Date; max?: Date } | null>(null);

  const openPicker = () => {
    const now = new Date();
    const maximumDate = maxAheadMs ? new Date(now.getTime() + maxAheadMs) : undefined;
    const initial = value ?? inMinutes(60)();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        minimumDate: now,
        maximumDate,
        onValueChange: (_e, date) => {
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            onValueChange: (_e2, time) => onChange(time),
          });
        },
      });
    } else if (Platform.OS === 'ios') {
      setDraft(initial);
      setBounds({ min: now, max: maximumDate });
      setIosOpen(true);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={[styles.box, !!error && { borderColor: colors.danger }]} accessibilityRole="button">
        <Icon name="calendar-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.value, !value && { color: colors.textMuted }]}>{value ? formatWhen(value.toISOString()) : 'Pick a time'}</Text>
        {Platform.OS !== 'web' && <Icon name="chevron-forward" size={16} color={colors.textMuted} />}
      </Pressable>
      <View style={styles.presets}>
        {presets.map((p) => (
          <Chip key={p.label} label={p.label} onPress={() => onChange(p.at())} />
        ))}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}

      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} transparent animationType="slide" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)} />
          <View style={styles.sheet}>
            {draft && (
              <RNDateTimePicker
                value={draft}
                mode="datetime"
                display="spinner"
                minimumDate={bounds?.min}
                maximumDate={bounds?.max}
                onValueChange={(_e, d) => setDraft(d)}
              />
            )}
            <Button title="Done" onPress={() => { if (draft) onChange(draft); setIosOpen(false); }} />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  box: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 50, paddingHorizontal: 14,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  value: { flex: 1, fontSize: 15, color: colors.text },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { fontSize: 12, color: colors.danger },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: colors.surface, padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
});
