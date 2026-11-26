import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GROUP_TYPES } from '@/components/GroupBits';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useCreateGroup } from '@/features/groups';
import { errorMessage } from '@/lib/api';
import { colors, font, spacing } from '@/lib/theme';

const schema = z.object({
  name: z.string().trim().min(1, 'Give your group a name').max(60),
  type: z.enum(['OFFICE', 'COLLEGE', 'CLASS', 'FRIENDS']),
  description: z.string().trim().max(300),
  requireApproval: z.boolean(),
});

export default function NewGroup() {
  const create = useCreateGroup();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'OFFICE' as const, description: '', requireApproval: false },
  });

  const submit = handleSubmit((v) =>
    create.mutate(
      { name: v.name, type: v.type, description: v.description || undefined, joinMode: v.requireApproval ? 'APPROVAL' : 'OPEN' },
      {
        onSuccess: (g) => router.replace(`/groups/${g.id}?created=1`),
        onError: (e) => Alert.alert("Couldn't create group", errorMessage(e)),
      },
    ),
  );

  return (
    <Screen back title="New group" footer={<Button title="Create group" onPress={submit} loading={create.isPending} />}>
      <Controller control={control} name="name" render={({ field }) => (
        <TextField label="Group name" placeholder="Office Buddies" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
      )} />
      <Controller control={control} name="type" render={({ field }) => (
        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {GROUP_TYPES.map((t) => <Chip key={t.value} label={t.label} selected={field.value === t.value} onPress={() => field.onChange(t.value)} />)}
          </View>
        </View>
      )} />
      <Controller control={control} name="description" render={({ field }) => (
        <TextField label="Description" hint="(optional)" placeholder="Snacks, good vibes and coffee runs" multiline value={field.value} onChangeText={field.onChange} error={errors.description?.message} />
      )} />
      <Controller control={control} name="requireApproval" render={({ field }) => (
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Approve new members</Text>
            <Text style={font.small}>People with the invite code send a request instead of joining directly.</Text>
          </View>
          <Switch value={field.value} onValueChange={field.onChange} trackColor={{ true: colors.primary }} />
        </View>
      )} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
