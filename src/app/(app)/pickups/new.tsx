import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { DateTimeField, PRESETS } from '@/components/DateTimeField';
import { GroupPicker } from '@/components/GroupBits';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { CATEGORY_LABEL, useCreateOffer } from '@/features/pickups';
import { errorMessage } from '@/lib/api';
import type { PickupCategory } from '@/lib/types';
import { colors, font, spacing } from '@/lib/theme';

const CATEGORIES = Object.keys(CATEGORY_LABEL) as PickupCategory[];

const schema = z.object({
  groupId: z.number().nullable().refine((v) => v !== null, 'Choose a group'),
  destination: z.string().trim().min(1, 'Where are you going?').max(120),
  note: z.string().trim().max(300),
  availableUntil: z.date().nullable().refine((d) => d !== null, 'Until when can people request?')
    .refine((d) => !d || d.getTime() > Date.now(), 'Must be in the future')
    .refine((d) => !d || d.getTime() <= Date.now() + 24 * 3_600_000, 'At most 24 hours from now'),
  categories: z.array(z.enum(['SNACKS', 'DRINKS', 'ESSENTIALS'])).min(1, 'Pick at least one'),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export default function NewPickup() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const create = useCreateOffer();
  const { control, handleSubmit, formState: { errors } } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { groupId: groupId ? Number(groupId) : null, destination: '', note: '', availableUntil: null, categories: ['SNACKS', 'DRINKS'] },
  });

  const submit = handleSubmit((v) =>
    create.mutate(
      { groupId: v.groupId, destination: v.destination, note: v.note || undefined, availableUntil: v.availableUntil.toISOString(), categories: v.categories },
      { onSuccess: (o) => router.replace(`/pickups/${o.id}`), onError: (e) => Alert.alert("Couldn't post offer", errorMessage(e)) },
    ),
  );

  return (
    <Screen back title="Pickup Offer" footer={<Button title="Post offer" onPress={submit} loading={create.isPending} />}>
      <Controller control={control} name="groupId" render={({ field }) => <GroupPicker value={field.value} onChange={field.onChange} error={errors.groupId?.message} />} />
      <Controller control={control} name="destination" render={({ field }) => (
        <TextField label="Where are you heading?" icon="storefront-outline" placeholder="Grocery store on Main Street" value={field.value} onChangeText={field.onChange} error={errors.destination?.message} />
      )} />
      <Controller control={control} name="availableUntil" render={({ field }) => (
        <DateTimeField label="Taking requests until" value={field.value} onChange={field.onChange} presets={PRESETS.duration}
          maxAheadMs={24 * 3_600_000} error={errors.availableUntil?.message} />
      )} />
      <Controller control={control} name="categories" render={({ field }) => (
        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Items you can pick up</Text>
          <View style={styles.row}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={CATEGORY_LABEL[c]} selected={field.value.includes(c)}
                onPress={() => field.onChange(field.value.includes(c) ? field.value.filter((x) => x !== c) : [...field.value, c])} />
            ))}
          </View>
          {errors.categories && <Text style={styles.error}>{errors.categories.message}</Text>}
          <Text style={font.tiny}>Pickups are for everyday items only. No medicine, alcohol or tobacco.</Text>
        </View>
      )} />
      <Controller control={control} name="note" render={({ field }) => (
        <TextField label="Note" hint="(optional)" placeholder="Snacks, drinks and chips. Anyone need anything?" multiline value={field.value} onChangeText={field.onChange} error={errors.note?.message} />
      )} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { fontSize: 12, color: colors.danger },
});
