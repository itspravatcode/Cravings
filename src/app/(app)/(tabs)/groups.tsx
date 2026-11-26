import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GroupIcon, groupTypeLabel } from '@/components/GroupBits';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/Badge';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { TextField } from '@/components/TextField';
import { useChatUnread } from '@/features/chat';
import { useMyGroups } from '@/features/groups';
import { colors, font, spacing } from '@/lib/theme';

export default function Groups() {
  const groups = useMyGroups();
  const { data: unread } = useChatUnread();
  const [search, setSearch] = useState('');
  const { refetch: refetchOnFocus } = groups;
  useFocusEffect(useCallback(() => { void refetchOnFocus(); }, [refetchOnFocus]));

  const list = (groups.data ?? []).filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <Screen
      title="My Groups"
      right={
        <Pressable onPress={() => router.push('/groups/new')} style={styles.add} accessibilityLabel="New group">
          <Icon name="add" size={22} color={colors.primaryDark} />
        </Pressable>
      }
      refreshControl={<RefreshControl refreshing={groups.isRefetching} onRefresh={() => void groups.refetch()} tintColor={colors.primary} />}
    >
      <TextField icon="search-outline" placeholder="Search groups…" value={search} onChangeText={setSearch} />
      <Button title="Join with invite code" variant="outline" icon="key-outline" onPress={() => router.push('/groups/join')} />
      {groups.isLoading ? <Loading /> : groups.isError ? <ErrorState error={groups.error} onRetry={groups.refetch} /> :
        list.length === 0 ? (
          <EmptyState icon="people-outline" title={search ? 'No matching groups' : 'No groups yet'}
            message={search ? undefined : 'Create a group for your office, class or friends, then share the invite code.'}
            action={search ? undefined : <Button title="Create a group" onPress={() => router.push('/groups/new')} />} />
        ) : list.map((g) => (
          <Card key={g.id} onPress={() => g.myStatus === 'ACTIVE' && router.push(`/groups/${g.id}`)} style={styles.row}>
            <GroupIcon type={g.type} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={font.subheading}>{g.name}</Text>
              <Text style={font.small}>{g.memberCount} member{g.memberCount === 1 ? '' : 's'} · {groupTypeLabel(g.type)}</Text>
              {g.description && <Text style={font.tiny} numberOfLines={1}>{g.description}</Text>}
            </View>
            {g.myStatus === 'PENDING' ? <StatusBadge label="Pending" tone="warn" /> : unread?.byGroup[g.id] ? (
              <View style={styles.badge}><Text style={styles.badgeText}>{unread.byGroup[g.id] > 99 ? '99+' : unread.byGroup[g.id]}</Text></View>
            ) : <Icon name="chevron-forward" size={18} color={colors.textMuted} />}
          </Card>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
