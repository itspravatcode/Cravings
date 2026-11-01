import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePickupStore } from '@/features/pickups';
import { useGroupStore } from '@/features/groups';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { PickupOffer } from '@/types';
import { Loader } from '@/components/Loader';

export default function PickupOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { offers, fetchPickups, isLoading: isLoadingOffers } = usePickupStore.getState();
  const { groups, fetchGroups } = useGroupStore.getState();

  const offer = offers.find((o) => o.id === id);
  const group = offer ? groups.find((g) => g.id === offer.groupId) : null;
  const isLoading = isLoadingOffers;

  React.useEffect(() => {
    fetchPickups('group_1');
    fetchGroups();
  }, [id, fetchPickups, fetchGroups]);

  if (!offer) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>Pickup offer not found</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pickup Offer</Text>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuText}>…</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.basketIcon}>🛒</Text>
        <Text style={styles.titleText}>{offer.title}</Text>
        <Text style={styles.descText}>{offer.description}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Available until</Text>
          <Text style={styles.metaText}>{new Date(offer.time).toLocaleString()}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaText}>{offer.location}</Text>
        </View>

        <Text style={styles.itemsLabel}>Items you can request</Text>
        <View style={styles.itemsRow}>
          {offer.items.map((item) => (
            <TouchableOpacity key={item.id} style={styles.itemChip}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Request Item"
          variant="primary"
          onPress={() => {}}
          style={styles.requestBtn}
        />
      </View>

      <View style={styles.postedBy}>
        <Text style={styles.postedLabel}>Posted by</Text>
        <View style={styles.postedRow}>
          <View style={styles.avatarSmall}><Text style={styles.avatarSmallText}>A</Text></View>
          <Text style={styles.postedName}>{group?.name || 'Alex'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  menuBtn: {
    padding: 8,
  },
  menuText: {
    fontSize: 22,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  basketIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  descText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 14,
    color: colors.text,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  requestBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
  },
  postedBy: {
    paddingHorizontal: 20,
  },
  postedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  postedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  postedName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});