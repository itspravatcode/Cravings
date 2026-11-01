import { View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import React from 'react';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

const GROUP_ICONS: Record<string, string> = {
  office: '🏢',
  college: '🎓',
  class: '🏫',
  friends: '👥',
};

const GROUP_ICON_BG: Record<string, string> = {
  office: '#DCFCE7',
  college: '#DBEAFE',
  class: '#F3E8FF',
  friends: '#FED7AA',
};

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, fetchGroups, isLoading, error, createGroup } = useGroupStore.getState();
  const [search, setSearch] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newType, setNewType] = React.useState<'OFFICE' | 'COLLEGE' | 'CLASS' | 'FRIENDS'>('OFFICE');

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createGroup({
      name: newName,
      description: newDesc,
      type: newType,
    });
    if (result) {
      setNewName('');
      setNewDesc('');
      setNewType('OFFICE');
    }
  };

  const filteredGroups = React.useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Groups</Text>
        <Button title="+" variant="outline" onPress={handleCreate} style={styles.createBtn} />
      </View>

      {/* Quick create */}
      <View style={styles.createWrap}>
        <TextInput
          placeholder="Group name"
          value={newName}
          onChangeText={setNewName}
          style={styles.createInput}
        />
        <Button title="Create" variant="outline" onPress={handleCreate} style={styles.createBtnInline} />
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search groups..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Groups list */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/groups/${item.id}`)}
            style={styles.groupRow}
          >
            <View style={[styles.iconBadge, { backgroundColor: GROUP_ICON_BG[item.type.toLowerCase()] }]}>
              <Text style={styles.iconText}>{GROUP_ICONS[item.type.toLowerCase()]}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.memberLine}>
                {item.memberIds.length} members{'  '}
                <Text style={styles.tags}>{item.type.toLowerCase()}</Text>
              </Text>
              <Text style={styles.inviteCode}>{item.inviteCode}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  createBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 20,
    minWidth: 36,
    alignItems: 'center',
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 15,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  memberLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  tags: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  inviteCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  createWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  createInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  createBtnInline: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 40,
  },
});