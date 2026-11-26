import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { DateTimeField } from '@/components/DateTimeField';
import { GroupPicker } from '@/components/GroupBits';
import { Screen } from '@/components/Screen';
import { Loading } from '@/components/States';
import { TextField } from '@/components/TextField';
import { useCreatePlan, usePlan, useUpdatePlan } from '@/features/plans';
import { errorMessage } from '@/lib/api';

const schema = z.object({
  groupId: z.number({ error: 'Choose a group' }).nullable().refine((v) => v !== null, 'Choose a group'),
  title: z.string().trim().min(1, 'Add a title').max(80),
  description: z.string().trim().max(500),
  location: z.string().trim().min(1, 'Where are you meeting?').max(120),
  startsAt: z.date({ error: 'Pick a time' }).nullable()
    .refine((d) => d !== null, 'Pick a time')
    .refine((d) => !d || d.getTime() > Date.now(), 'Must be in the future'),
  limit: z.string().trim().refine((s) => s === '' || (/^\d+$/.test(s) && +s >= 2 && +s <= 100), 'Between 2 and 100'),
  imageUrl: z.union([z.literal(''), z.url('Must be a link starting with http(s)://')]),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

/** Create a plan, or edit one with ?edit=<id>. */
export default function PlanForm() {
  const { edit, groupId } = useLocalSearchParams<{ edit?: string; groupId?: string }>();
  const editId = edit ? Number(edit) : null;
  const existing = usePlan(editId ?? 0);
  const create = useCreatePlan();
  const update = useUpdatePlan(editId ?? 0);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { groupId: groupId ? Number(groupId) : null, title: '', description: '', location: '', startsAt: null, limit: '', imageUrl: '' },
  });

  useEffect(() => {
    const p = existing.data;
    if (editId && p) {
      reset({ groupId: p.group.id, title: p.title, description: p.description ?? '', location: p.location,
        startsAt: new Date(p.startsAt), limit: p.participantLimit ? String(p.participantLimit) : '', imageUrl: p.imageUrl ?? '' });
    }
  }, [editId, existing.data, reset]);

  const submit = handleSubmit((v) => {
    const body = {
      title: v.title, description: v.description, location: v.location, startsAt: v.startsAt.toISOString(), imageUrl: v.imageUrl,
    };
    const opts = { onSuccess: (p: { id: number }) => router.replace(`/plans/${p.id}`), onError: (e: unknown) => Alert.alert("Couldn't save plan", errorMessage(e)) };
    if (editId) update.mutate({ ...body, ...(v.limit ? { participantLimit: +v.limit } : { clearParticipantLimit: true }) }, opts);
    else create.mutate({ ...body, groupId: v.groupId, participantLimit: v.limit ? +v.limit : undefined,
      description: v.description || undefined, imageUrl: v.imageUrl || undefined }, opts);
  });

  if (editId && existing.isLoading) return <Loading />;

  return (
    <Screen back title={editId ? 'Edit Snack Plan' : 'Create Snack Plan'}
      footer={<Button title={editId ? 'Save changes' : 'Create plan'} onPress={submit} loading={create.isPending || update.isPending} />}>
      {!editId && (
        <Controller control={control} name="groupId" render={({ field }) => <GroupPicker value={field.value} onChange={field.onChange} error={errors.groupId?.message} />} />
      )}
      <Controller control={control} name="title" render={({ field }) => (
        <TextField label="Title" placeholder="Evening Snack Run" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />
      )} />
      <Controller control={control} name="startsAt" render={({ field }) => (
        <DateTimeField label="Time" value={field.value} onChange={field.onChange} error={errors.startsAt?.message} />
      )} />
      <Controller control={control} name="location" render={({ field }) => (
        <TextField label="Location" icon="location-outline" placeholder="Campus Food Court" value={field.value} onChangeText={field.onChange} error={errors.location?.message} />
      )} />
      <Controller control={control} name="limit" render={({ field }) => (
        <TextField label="Participant limit" hint="(optional)" icon="people-outline" placeholder="No limit" keyboardType="number-pad"
          value={field.value} onChangeText={field.onChange} error={errors.limit?.message} />
      )} />
      <Controller control={control} name="description" render={({ field }) => (
        <TextField label="Details" hint="(optional)" placeholder="Pizza, burgers & more" multiline value={field.value} onChangeText={field.onChange} error={errors.description?.message} />
      )} />
      <Controller control={control} name="imageUrl" render={({ field }) => (
        <TextField label="Image" hint="(optional link)" icon="image-outline" placeholder="https://…" autoCapitalize="none" keyboardType="url"
          value={field.value} onChangeText={field.onChange} error={errors.imageUrl?.message} />
      )} />
    </Screen>
  );
}
