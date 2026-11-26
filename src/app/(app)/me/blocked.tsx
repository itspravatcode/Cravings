import { Alert, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useBlock, useBlocked } from '@/features/safety';
import { errorMessage } from '@/lib/api';
import { font, spacing } from '@/lib/theme';

export default function Blocked() {
  const blocked = useBlocked();
  const block = useBlock();
  return (
    <Screen back title="Blocked people">
      <Text style={font.small}>You don’t see messages, posts or notifications from people you block. They aren’t told.</Text>
      {blocked.isLoading ? <Loading /> : blocked.isError ? <ErrorState error={blocked.error} onRetry={() => void blocked.refetch()} /> :
        (blocked.data ?? []).length === 0 ? <EmptyState icon="happy-outline" title="Nobody blocked" message="Block someone from their chat message or the group's member list." /> :
        blocked.data!.map((u) => (
          <Card key={u.id} style={styles.row}>
            <Avatar user={u} />
            <View style={{ flex: 1 }}>
              <Text style={font.body}>{u.name}</Text>
              <Text style={font.tiny}>@{u.username}</Text>
            </View>
            <Button title="Unblock" size="sm" variant="secondary"
              onPress={() => block.mutate({ userId: u.id, block: false }, { onError: (e) => Alert.alert("Couldn't unblock", errorMessage(e)) })} />
          </Card>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md } });
