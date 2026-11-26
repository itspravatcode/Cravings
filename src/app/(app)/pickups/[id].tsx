import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { ReportSheet, type ReportTargetInput } from '@/components/ReportSheet';
import { StatusBadge, TypeBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/States';
import { TextField } from '@/components/TextField';
import { CATEGORY_LABEL, useCreateRequest, useOffer, useOfferAction, useOfferRequests, useRequestAction } from '@/features/pickups';
import { ApiError, errorMessage } from '@/lib/api';
import { formatWhen, timeAgo } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { PickupCategory, PickupRequest } from '@/lib/types';
import { colors, font, radius, spacing } from '@/lib/theme';

const REQUEST_STATUS: Record<PickupRequest['status'], { label: string; tone: 'neutral' | 'good' | 'warn' | 'bad' }> = {
  PENDING: { label: 'Pending', tone: 'warn' },
  ACCEPTED: { label: 'Accepted', tone: 'good' },
  COMPLETED: { label: 'Picked up', tone: 'good' },
  DECLINED: { label: 'Declined', tone: 'bad' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

export default function PickupDetails() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const me = useSession((s) => s.user);
  const offer = useOffer(id);
  const requests = useOfferRequests(id);
  const offerAction = useOfferAction();
  const requestAction = useRequestAction();
  const create = useCreateRequest(id);
  const [composing, setComposing] = useState(false);
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<PickupCategory | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTargetInput | null>(null);

  if (offer.isLoading) return <Screen back><Loading /></Screen>;
  if (!offer.data) return <Screen back><ErrorState error={offer.error} onRetry={offer.refetch} /></Screen>;
  const o = offer.data;
  const isCreator = o.creator.id === me?.id;
  const open = o.status === 'OPEN';
  const fail = (e: unknown) => Alert.alert('Something went wrong', errorMessage(e));
  const cat = category ?? o.categories[0];

  const submitRequest = () => {
    if (!item.trim()) return setFormError('What should they pick up?');
    setFormError(null);
    create.mutate({ itemName: item.trim(), category: cat, quantity: qty, note: note.trim() || undefined }, {
      onSuccess: () => { setComposing(false); setItem(''); setNote(''); setQty(1); },
      onError: (e) => (e instanceof ApiError && e.status < 500 ? setFormError(e.message) : fail(e)),
    });
  };

  const offerMenu = () => Alert.alert('Manage offer', undefined, [
    { text: 'Stop taking requests', onPress: () => offerAction.mutate({ id, action: 'close' }, { onError: fail }) },
    { text: 'Cancel trip', style: 'destructive', onPress: () => offerAction.mutate({ id, action: 'cancel' }, { onError: fail }) },
    { text: 'Back', style: 'cancel' },
  ]);

  const footer = !isCreator && open && !composing ? <Button title="Request an item" icon="add" onPress={() => setComposing(true)} /> : null;

  return (
    <Screen back title="Pickup Offer" footer={footer}
      right={isCreator && open ? <Pressable onPress={offerMenu} hitSlop={10} accessibilityLabel="Manage offer"><Icon name="ellipsis-horizontal" size={22} /></Pressable>
        : !isCreator ? <Pressable onPress={() => setReportTarget({ targetType: 'PICKUP', targetId: id })} hitSlop={10} accessibilityLabel="Report offer"><Icon name="flag-outline" size={22} /></Pressable> : undefined}>
      <View style={styles.badges}>
        <TypeBadge type="PICKUP" />
        {!open && <StatusBadge label={o.status === 'CLOSED' ? 'Closed' : 'Cancelled'} tone={o.status === 'CANCELLED' ? 'bad' : 'neutral'} />}
      </View>
      <Text style={font.title}>On the way to {o.destination}</Text>
      {o.note && <Text style={[font.body, { color: colors.textSecondary }]}>{o.note}</Text>}
      <Card style={{ gap: spacing.md }}>
        <View style={styles.row}><Icon name="time-outline" size={18} color={colors.primaryDark} />
          <Text style={font.body}>{open ? 'Available until' : 'Was available until'} {formatWhen(o.availableUntil)}</Text></View>
        <View style={styles.row}><Icon name="people-circle-outline" size={18} color={colors.primaryDark} /><Text style={font.body}>{o.group.name}</Text></View>
        <View style={styles.tags}>
          {o.categories.map((c) => <View key={c} style={styles.tag}><Text style={styles.tagText}>{CATEGORY_LABEL[c]}</Text></View>)}
        </View>
        <View style={styles.row}>
          <Avatar user={o.creator} size={28} />
          <Text style={font.small}>Posted by {isCreator ? 'you' : o.creator.name} · {timeAgo(o.createdAt)}</Text>
        </View>
      </Card>

      {composing && (
        <Card style={{ gap: spacing.md }}>
          <Text style={font.subheading}>New request</Text>
          <TextField label="Item" placeholder="Chips, cola, toothpaste…" value={item} onChangeText={setItem} autoFocus />
          <View style={styles.tags}>
            {o.categories.map((c) => <Chip key={c} label={CATEGORY_LABEL[c]} selected={cat === c} onPress={() => setCategory(c)} />)}
          </View>
          <View style={styles.row}>
            <Text style={[font.body, { flex: 1 }]}>Quantity</Text>
            <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.stepper} accessibilityLabel="Less"><Icon name="remove" size={18} /></Pressable>
            <Text style={[font.subheading, { minWidth: 28, textAlign: 'center' }]}>{qty}</Text>
            <Pressable onPress={() => setQty((q) => Math.min(20, q + 1))} style={styles.stepper} accessibilityLabel="More"><Icon name="add" size={18} /></Pressable>
          </View>
          <TextField label="Note" hint="(optional)" placeholder="Any brand is fine" value={note} onChangeText={setNote} />
          {formError && <Text style={{ color: colors.danger, fontSize: 13 }}>{formError}</Text>}
          <View style={styles.row}>
            <Button title="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => { setComposing(false); setFormError(null); }} />
            <Button title="Send request" style={{ flex: 2 }} onPress={submitRequest} loading={create.isPending} />
          </View>
        </Card>
      )}

      <Text style={font.subheading}>{isCreator ? 'Requests' : 'Your requests'}</Text>
      {requests.isLoading ? <Loading /> : (requests.data ?? []).length === 0 ? (
        <Text style={font.small}>{isCreator ? 'No requests yet.' : "You haven't requested anything."}</Text>
      ) : requests.data!.map((r) => (
        <Card key={r.id} style={{ gap: spacing.sm }}>
          <View style={styles.row}>
            {isCreator && <Avatar user={r.requester} size={32} />}
            <View style={{ flex: 1 }}>
              <Text style={font.subheading}>{r.quantity} × {r.itemName}</Text>
              <Text style={font.tiny}>{isCreator ? `${r.requester.name} · ` : ''}{CATEGORY_LABEL[r.category]} · {timeAgo(r.createdAt)}</Text>
            </View>
            <StatusBadge {...REQUEST_STATUS[r.status]} />
          </View>
          {r.note && <Text style={font.small}>“{r.note}”</Text>}
          <View style={styles.actions}>
            {isCreator && r.status === 'PENDING' && (
              <>
                <Button title="Decline" size="sm" variant="ghost" onPress={() => requestAction.mutate({ id: r.id, action: 'decline' }, { onError: fail })} />
                <Button title="Accept" size="sm" onPress={() => requestAction.mutate({ id: r.id, action: 'accept' }, { onError: fail })} />
              </>
            )}
            {isCreator && r.status === 'ACCEPTED' && (
              <Button title="Mark picked up" size="sm" icon="checkmark" onPress={() => requestAction.mutate({ id: r.id, action: 'complete' }, { onError: fail })} />
            )}
            {!isCreator && (r.status === 'PENDING' || r.status === 'ACCEPTED') && (
              <Button title="Cancel request" size="sm" variant="ghost" onPress={() => requestAction.mutate({ id: r.id, action: 'cancel' }, { onError: fail })} />
            )}
          </View>
        </Card>
      ))}
      <ReportSheet target={reportTarget} what="pickup offer" onClose={() => setReportTarget(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.pickupSoft },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.pickup },
  stepper: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
