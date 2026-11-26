import { useLocalSearchParams } from 'expo-router';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useGroup } from '@/features/groups';
import { useGroupReports, useResolveReport } from '@/features/safety';
import { errorMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import type { Report } from '@/lib/types';
import { colors, font, spacing } from '@/lib/theme';

const WHAT: Record<Report['targetType'], string> = { MESSAGE: 'Chat message', USER: 'Member', PLAN: 'Snack plan', POLL: 'Poll', PICKUP: 'Pickup offer' };
const REMOVE_LABEL: Record<Report['targetType'], string> = {
  MESSAGE: 'Delete message', USER: 'Remove from group', PLAN: 'Cancel plan', POLL: 'Close poll', PICKUP: 'Cancel offer',
};
const REASON: Record<Report['reason'], string> = { SPAM: 'Spam', HARASSMENT: 'Harassment', INAPPROPRIATE: 'Inappropriate', OTHER: 'Other' };

/** Group owner's moderation queue. Reporters stay anonymous. */
export default function Reports() {
  const groupId = Number(useLocalSearchParams<{ groupId: string }>().groupId);
  const group = useGroup(groupId);
  const reports = useGroupReports(groupId);
  const resolve = useResolveReport(groupId);

  const act = (r: Report, action: 'REMOVE' | 'DISMISS') => {
    const run = () => resolve.mutate({ reportId: r.id, action }, { onError: (e) => Alert.alert('Something went wrong', errorMessage(e)) });
    if (action === 'DISMISS') return run();
    Alert.alert(`${REMOVE_LABEL[r.targetType]}?`, r.targetType === 'USER'
      ? `${r.targetUser?.name ?? 'This member'} will lose access to the group.`
      : 'Everyone in the group will stop seeing it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: REMOVE_LABEL[r.targetType], style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen back title="Reports" refreshControl={<RefreshControl refreshing={reports.isRefetching} onRefresh={() => void reports.refetch()} tintColor={colors.primary} />}>
      {group.data && <Text style={font.small}>Reports in {group.data.name}. Reporters stay anonymous.</Text>}
      {reports.isLoading ? <Loading /> : reports.isError ? <ErrorState error={reports.error} onRetry={() => void reports.refetch()} /> :
        (reports.data ?? []).length === 0 ? <EmptyState icon="shield-checkmark-outline" title="All clear" message="No reports waiting for review." /> :
        reports.data!.map((r) => (
          <Card key={r.id} style={{ gap: spacing.sm }}>
            <View style={styles.row}>
              <StatusBadge label={WHAT[r.targetType]} />
              <StatusBadge label={REASON[r.reason]} tone="bad" />
              <Text style={[font.tiny, { marginLeft: 'auto' }]}>{timeAgo(r.createdAt)}</Text>
            </View>
            {r.targetUser && (
              <View style={styles.row}>
                <Avatar user={r.targetUser} size={28} />
                <Text style={font.body}>{r.targetUser.name} <Text style={font.small}>@{r.targetUser.username}</Text></Text>
              </View>
            )}
            {r.snapshot && r.targetType !== 'USER' && <Text style={styles.quote}>“{r.snapshot}”</Text>}
            {r.details && <Text style={font.small}>Reporter says: {r.details}</Text>}
            <View style={styles.actions}>
              <Button title="Dismiss" size="sm" variant="ghost" onPress={() => act(r, 'DISMISS')} />
              <Button title={REMOVE_LABEL[r.targetType]} size="sm" variant="danger" onPress={() => act(r, 'REMOVE')} loading={resolve.isPending} />
            </View>
          </Card>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  quote: { ...font.body, backgroundColor: colors.surfaceMuted, padding: spacing.md, borderRadius: 12, fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
