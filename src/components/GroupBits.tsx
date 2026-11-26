import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useActiveGroups } from '@/features/groups';
import type { GroupType, Id } from '@/lib/types';
import { colors, radius, spacing } from '@/lib/theme';
import { Button } from './Button';
import { Chip } from './Chip';
import { Icon, type IconName } from './Icon';

const GROUP_LOOK: Record<GroupType, { icon: IconName; color: string; soft: string; label: string }> = {
  OFFICE: { icon: 'business-outline', color: colors.plan, soft: colors.planSoft, label: 'Office' },
  COLLEGE: { icon: 'school-outline', color: colors.pickup, soft: colors.pickupSoft, label: 'College' },
  CLASS: { icon: 'book-outline', color: colors.poll, soft: colors.pollSoft, label: 'Class' },
  FRIENDS: { icon: 'people-outline', color: colors.primary, soft: colors.primarySoft, label: 'Friends' },
};

export const GROUP_TYPES = Object.entries(GROUP_LOOK).map(([value, l]) => ({ value: value as GroupType, label: l.label }));

export function GroupIcon({ type, size = 52 }: { type: GroupType; size?: number }) {
  const look = GROUP_LOOK[type];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: look.soft, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={look.icon} size={size * 0.5} color={look.color} />
    </View>
  );
}

export function groupTypeLabel(type: GroupType) {
  return GROUP_LOOK[type].label;
}

/** "Post to" selector used by every create form. */
export function GroupPicker({ value, onChange, error }: { value: Id | null; onChange: (id: Id) => void; error?: string }) {
  const { data: groups, isLoading } = useActiveGroups();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Group</Text>
      {isLoading ? null : groups && groups.length > 0 ? (
        <View style={styles.row}>
          {groups.map((g) => (
            <Chip key={g.id} label={g.name} selected={g.id === value} onPress={() => onChange(g.id)} />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Icon name="people-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.emptyText}>You need a group first.</Text>
          <Button title="Create or join" size="sm" variant="secondary" onPress={() => router.push('/groups/new')} />
        </View>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  emptyText: { flex: 1, fontSize: 13, color: colors.textSecondary },
  error: { fontSize: 12, color: colors.danger },
});
