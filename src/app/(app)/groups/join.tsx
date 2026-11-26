import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GroupIcon, groupTypeLabel } from '@/components/GroupBits';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAcceptInvite, useInvitePreview, useJoinGroup } from '@/features/groups';
import { ApiError, errorMessage } from '@/lib/api';
import type { JoinResult } from '@/lib/types';
import { colors, font, spacing } from '@/lib/theme';

/** Join by invite code, or accept a direct invite when opened with ?groupId=…&name=… from Activity. */
export default function JoinGroup() {
  const params = useLocalSearchParams<{ groupId?: string; name?: string }>();
  const [code, setCode] = useState('');
  const preview = useInvitePreview(code);
  const join = useJoinGroup();
  const accept = useAcceptInvite();

  const done = (r: JoinResult) => {
    if (r.status === 'ACTIVE') router.replace(`/groups/${r.group.id}`);
    else {
      Alert.alert('Request sent', `The owner of ${r.group.name} will review your request.`);
      router.back();
    }
  };
  const fail = (e: unknown) => Alert.alert("Couldn't join", errorMessage(e));

  if (params.groupId) {
    return (
      <Screen back title="Group invite">
        <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <Text style={font.small}>{"You've been invited to"}</Text>
          <Text style={font.heading}>{params.name || 'a group'}</Text>
          <Button title="Join group" style={{ alignSelf: 'stretch' }} loading={accept.isPending}
            onPress={() => accept.mutate(Number(params.groupId), { onSuccess: done, onError: fail })} />
        </Card>
      </Screen>
    );
  }

  const notFound = preview.error instanceof ApiError && preview.error.status === 404;
  const g = preview.data;
  return (
    <Screen back title="Join a group">
      <Text style={[font.body, { color: colors.textSecondary }]}>{"Ask a member for the group's invite code."}</Text>
      <TextField icon="key-outline" placeholder="e.g. 2GW4UV4V" autoCapitalize="characters" autoCorrect={false}
        value={code} onChangeText={(t) => setCode(t.toUpperCase().replace(/\s/g, ''))} maxLength={12}
        error={notFound ? 'No group found with this code' : undefined} />
      {g && (
        <Card style={{ gap: spacing.md }}>
          <View style={styles.row}>
            <GroupIcon type={g.type} />
            <View style={{ flex: 1 }}>
              <Text style={font.subheading}>{g.name}</Text>
              <Text style={font.small}>{g.memberCount} members · {groupTypeLabel(g.type)}</Text>
            </View>
          </View>
          {g.description && <Text style={font.small}>{g.description}</Text>}
          {g.myStatus === 'ACTIVE' ? (
            <Button title="Open group" variant="secondary" onPress={() => router.replace(`/groups/${g.id}`)} />
          ) : g.myStatus === 'PENDING' ? (
            <Text style={[font.small, { textAlign: 'center' }]}>Your request is waiting for approval.</Text>
          ) : (
            <Button title={g.joinMode === 'APPROVAL' ? 'Request to join' : 'Join group'} loading={join.isPending}
              onPress={() => join.mutate(code, { onSuccess: done, onError: fail })} />
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md } });
