import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { z } from 'zod';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useChangePassword, useDeleteAccount, useUpdateProfile } from '@/features/auth';
import { API_URL, ApiError, errorMessage } from '@/lib/api';
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { colors, font, spacing } from '@/lib/theme';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  username: z.string().trim().regex(/^[a-zA-Z0-9_.]{3,30}$/, '3–30 letters, numbers, _ or .'),
  avatarUrl: z.union([z.literal(''), z.url('Must be a link starting with http(s)://')]),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(8, 'At least 8 characters').max(72),
});

export default function EditProfile() {
  const user = useSession((s) => s.user)!;
  const update = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const profile = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, username: user.username, avatarUrl: user.avatarUrl ?? '' } });
  const password = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '' } });
  const avatar = useWatch({ control: profile.control, name: 'avatarUrl' });

  const saveProfile = profile.handleSubmit((v) => update.mutate(v, {
    onSuccess: () => router.back(),
    onError: (e) => e instanceof ApiError && e.code === 'USERNAME_TAKEN'
      ? profile.setError('username', { message: e.message }) : Alert.alert("Couldn't save", errorMessage(e)),
  }));
  const savePassword = password.handleSubmit((v) => changePassword.mutate(v, {
    onSuccess: () => { password.reset(); Alert.alert('Password updated'); },
    onError: (e) => e instanceof ApiError && e.code === 'WRONG_PASSWORD'
      ? password.setError('currentPassword', { message: e.message }) : Alert.alert("Couldn't update password", errorMessage(e)),
  }));

  return (
    <Screen back title="Edit profile">
      <View style={{ alignItems: 'center' }}>
        <Avatar user={{ ...user, avatarUrl: avatar && /^https?:\/\//.test(avatar) ? avatar : null }} size={88} />
      </View>
      <Controller control={profile.control} name="name" render={({ field }) => (
        <TextField label="Full name" value={field.value} onChangeText={field.onChange} error={profile.formState.errors.name?.message} />
      )} />
      <Controller control={profile.control} name="username" render={({ field }) => (
        <TextField label="Username" icon="at-outline" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={profile.formState.errors.username?.message} />
      )} />
      <Controller control={profile.control} name="avatarUrl" render={({ field }) => (
        <TextField label="Profile picture" hint="(link)" icon="image-outline" autoCapitalize="none" keyboardType="url" placeholder="https://…"
          value={field.value} onChangeText={field.onChange} error={profile.formState.errors.avatarUrl?.message} />
      )} />
      <Button title="Save profile" onPress={saveProfile} loading={update.isPending} />

      <Card style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <Text style={font.subheading}>Change password</Text>
        <Controller control={password.control} name="currentPassword" render={({ field }) => (
          <TextField placeholder="Current password" secure value={field.value} onChangeText={field.onChange} error={password.formState.errors.currentPassword?.message} />
        )} />
        <Controller control={password.control} name="newPassword" render={({ field }) => (
          <TextField placeholder="New password" secure value={field.value} onChangeText={field.onChange} error={password.formState.errors.newPassword?.message} />
        )} />
        <Button title="Update password" variant="secondary" onPress={savePassword} loading={changePassword.isPending} />
      </Card>
      <Card style={{ gap: spacing.md, borderColor: colors.dangerSoft }}>
        <Text style={[font.subheading, { color: colors.danger }]}>Delete account</Text>
        <Text style={font.small}>
          This permanently deletes your profile, your plans, polls and pickups, your votes and requests, and your chat messages.
          Groups you own are handed to another member, or deleted if you’re the only one. This can’t be undone.
        </Text>
        <TextField placeholder="Enter your password to confirm" secure value={deletePassword} onChangeText={(t) => { setDeletePassword(t); setDeleteError(null); }}
          error={deleteError ?? undefined} />
        <Button title="Delete my account" variant="danger" loading={deleteAccount.isPending} disabled={!deletePassword}
          onPress={() => Alert.alert('Delete your account?', 'Everything you created will be removed. This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete forever', style: 'destructive', onPress: () => deleteAccount.mutate(deletePassword, {
              onError: (e) => e instanceof ApiError && e.code === 'WRONG_PASSWORD' ? setDeleteError(e.message) : Alert.alert("Couldn't delete account", errorMessage(e)),
            }) },
          ])} />
      </Card>
      <Text style={[font.tiny, { textAlign: 'center' }]}>{user.email} · Server: {API_URL}</Text>
    </Screen>
  );
}
