import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { hrefForActivity } from '@/lib/links';
import { registerForPush } from '@/lib/push';
import { useSession } from '@/lib/session';
import type { ActivitySubject, ActivityType, Id, NotificationSettings } from '@/lib/types';
import { getOpenChat } from './chat';
import { queryClient } from './queryClient';

type PushData =
  | { kind: 'chat'; groupId: Id; messageId: Id }
  | { kind: 'activity'; type: ActivityType; subjectType: ActivitySubject; subjectId: Id; groupId?: Id };

// While the app is open: show notifications as banners, except chat for the conversation on screen.
Notifications.setNotificationHandler({
  handleNotification: async (n) => {
    const data = n.request.content.data as Partial<PushData> | undefined;
    const looking = data?.kind === 'chat' && data.groupId === getOpenChat();
    return { shouldShowBanner: !looking, shouldShowList: !looking, shouldPlaySound: !looking, shouldSetBadge: false };
  },
});

function hrefFor(data: Partial<PushData> | undefined): Href | null {
  if (!data?.kind) return null;
  if (data.kind === 'chat' && data.groupId) return `/chat/${data.groupId}`;
  if (data.kind === 'activity' && data.type && data.subjectType && data.subjectId) {
    return hrefForActivity({ type: data.type, subjectType: data.subjectType, subjectId: data.subjectId });
  }
  return null;
}

/**
 * Mount once inside the signed-in area. Registers this device for push, keeps the token fresh,
 * and opens the right screen when a notification is tapped (including the one that launched the app).
 */
export function usePushNotifications() {
  const token = useSession((s) => s.token);
  const last = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void registerForPush();
    const tokenSub = Notifications.addPushTokenListener(() => {
      // The listener gives the raw device token; ask for the Expo token again.
      void registerForPush(false);
    });
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    });
    return () => {
      tokenSub.remove();
      receivedSub.remove();
    };
  }, [token]);

  useEffect(() => {
    if (!token || !last || last.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = last.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    const href = hrefFor(last.notification.request.content.data as Partial<PushData>);
    if (href) router.push(href);
    void Notifications.clearLastNotificationResponseAsync();
  }, [token, last]);
}

export function useNotificationSettings() {
  return useQuery({ queryKey: ['me', 'notification-settings'], queryFn: () => api.get<NotificationSettings>('/me/notification-settings') });
}

export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: (patch: Partial<NotificationSettings>) => api.patch<NotificationSettings>('/me/notification-settings', patch),
    onMutate: (patch) => {
      const key = ['me', 'notification-settings'];
      const previous = queryClient.getQueryData<NotificationSettings>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, ...patch });
      return { previous };
    },
    onError: (_e, _p, ctx) => ctx?.previous && queryClient.setQueryData(['me', 'notification-settings'], ctx.previous),
    onSuccess: (s) => queryClient.setQueryData(['me', 'notification-settings'], s),
  });
}

export function useMuteChat(groupId: Id) {
  return useMutation({
    mutationFn: (muted: boolean) => api.put<void>(`/groups/${groupId}/chat-mute`, { muted }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}
