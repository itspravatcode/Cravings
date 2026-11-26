import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { DateTimeField, PRESETS } from '@/components/DateTimeField';
import { GroupPicker } from '@/components/GroupBits';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useCreatePoll } from '@/features/polls';
import { errorMessage } from '@/lib/api';
import { colors, font, spacing } from '@/lib/theme';

const schema = z.object({
  groupId: z.number().nullable().refine((v) => v !== null, 'Choose a group'),
  question: z.string().trim().min(1, 'Ask a question').max(200),
  options: z.array(z.object({ label: z.string().trim().max(80) }))
    .refine((o) => o.filter((x) => x.label).length >= 2, 'Add at least 2 options')
    .refine((o) => {
      const l = o.map((x) => x.label.toLowerCase()).filter(Boolean);
      return new Set(l).size === l.length;
    }, 'Options must be different'),
  closesAt: z.date().nullable().refine((d) => d !== null, 'When does voting close?')
    .refine((d) => !d || d.getTime() > Date.now(), 'Must be in the future'),
  allowVoteChange: z.boolean(),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export default function NewPoll() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const create = useCreatePoll();
  const { control, handleSubmit, formState: { errors } } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupId: groupId ? Number(groupId) : null, question: '', options: [{ label: '' }, { label: '' }, { label: '' }],
      closesAt: null, allowVoteChange: true,
    },
  });
  const options = useFieldArray({ control, name: 'options' });

  const submit = (publish: boolean) => handleSubmit((v) =>
    create.mutate(
      { groupId: v.groupId, question: v.question, options: v.options.map((o) => o.label).filter(Boolean),
        closesAt: v.closesAt.toISOString(), allowVoteChange: v.allowVoteChange, publish },
      { onSuccess: (p) => router.replace(`/polls/${p.id}`), onError: (e) => Alert.alert("Couldn't create poll", errorMessage(e)) },
    ))();

  return (
    <Screen back title="Create Poll" footer={
      <View style={{ gap: spacing.sm }}>
        <Button title="Publish poll" onPress={() => submit(true)} loading={create.isPending} />
        <Button title="Save as draft" variant="ghost" size="sm" onPress={() => submit(false)} />
      </View>
    }>
      <Controller control={control} name="groupId" render={({ field }) => <GroupPicker value={field.value} onChange={field.onChange} error={errors.groupId?.message} />} />
      <Controller control={control} name="question" render={({ field }) => (
        <TextField label="Question" placeholder="What should we eat?" value={field.value} onChangeText={field.onChange} error={errors.question?.message} />
      )} />
      <View style={{ gap: spacing.sm }}>
        <Text style={styles.label}>Options</Text>
        {options.fields.map((f, i) => (
          <Controller key={f.id} control={control} name={`options.${i}.label`} render={({ field }) => (
            <TextField placeholder={['Pizza', 'Burgers', 'Sandwiches', 'Momos', 'Rolls', 'Salad'][i]} value={field.value} onChangeText={field.onChange}
              right={options.fields.length > 2 ? (
                <Pressable onPress={() => options.remove(i)} hitSlop={8} accessibilityLabel="Remove option"><Icon name="close-circle" size={20} color={colors.textMuted} /></Pressable>
              ) : undefined} />
          )} />
        ))}
        {options.fields.length < 6 && <Button title="Add option" icon="add" variant="ghost" size="sm" onPress={() => options.append({ label: '' })} />}
        {errors.options && <Text style={styles.error}>{errors.options.message ?? errors.options.root?.message}</Text>}
      </View>
      <Controller control={control} name="closesAt" render={({ field }) => (
        <DateTimeField label="Voting closes" value={field.value} onChange={field.onChange} presets={PRESETS.duration}
          maxAheadMs={30 * 86_400_000} error={errors.closesAt?.message} />
      )} />
      <Controller control={control} name="allowVoteChange" render={({ field }) => (
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Allow changing votes</Text>
            <Text style={font.small}>People can switch their vote until the poll closes.</Text>
          </View>
          <Switch value={field.value} onValueChange={field.onChange} trackColor={{ true: colors.primary }} />
        </View>
      )} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  error: { fontSize: 12, color: colors.danger },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
