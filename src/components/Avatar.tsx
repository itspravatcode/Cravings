import { Image, StyleSheet, Text, View } from 'react-native';
import type { UserSummary } from '@/lib/types';
import { colors } from '@/lib/theme';

const PALETTE = ['#F7801E', '#16A34A', '#7C3AED', '#2563EB', '#DB2777', '#0891B2', '#CA8A04'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

export function Avatar({ user, size = 36 }: { user: Pick<UserSummary, 'id' | 'name' | 'avatarUrl'>; size?: number }) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (user.avatarUrl) return <Image source={{ uri: user.avatarUrl }} style={[style, styles.ring]} accessibilityLabel={user.name} />;
  return (
    <View style={[style, styles.ring, styles.center, { backgroundColor: PALETTE[user.id % PALETTE.length] }]} accessibilityLabel={user.name}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials(user.name)}</Text>
    </View>
  );
}

/** Overlapping faces with a "+N" bubble, as on the feed cards. */
export function AvatarStack({ users, total, size = 26 }: { users: UserSummary[]; total?: number; size?: number }) {
  const extra = (total ?? users.length) - users.length;
  return (
    <View style={styles.row}>
      {users.map((u, i) => (
        <View key={u.id} style={{ marginLeft: i === 0 ? 0 : -size * 0.3 }}>
          <Avatar user={u} size={size} />
        </View>
      ))}
      {extra > 0 && (
        <View style={[styles.more, { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.3 }]}>
          <Text style={styles.moreText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 2, borderColor: colors.surface },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  more: { backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  moreText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
});
