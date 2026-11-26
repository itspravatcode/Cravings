import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

/**
 * Why push might not be active, so Settings can explain it:
 * - unsupported: simulator/emulator without push support
 * - no-project: the app isn't linked to an EAS project yet (run `eas init`)
 * - unavailable: running in Expo Go on Android (push needs a development build), or no Firebase config
 * - denied: the user said no in system settings
 */
export type PushStatus = 'enabled' | 'denied' | 'unsupported' | 'no-project' | 'unavailable';

let registeredToken: string | null = null;

export const CHANNELS = { activity: 'activity', chat: 'chat' } as const;

async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  // Channels must exist before asking permission on Android 13+, and pushes name them in `channelId`.
  await Notifications.setNotificationChannelAsync(CHANNELS.activity, {
    name: 'Plans, polls & pickups',
    importance: AndroidImportance.HIGH,
    lightColor: '#F7801E',
  });
  await Notifications.setNotificationChannelAsync(CHANNELS.chat, {
    name: 'Group chat',
    importance: AndroidImportance.HIGH,
    lightColor: '#F7801E',
  });
}

function projectId(): string | undefined {
  return Constants.easConfig?.projectId ?? (Constants.expoConfig?.extra?.eas?.projectId as string | undefined);
}

export async function permissionGranted(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Asks for permission (once) and sends this device's Expo push token to the backend. */
export async function registerForPush(askIfNeeded = true): Promise<PushStatus> {
  if (!Device.isDevice) return 'unsupported';
  const id = projectId();
  if (!id) return 'no-project';
  try {
    await ensureChannels();
    let granted = await permissionGranted();
    if (!granted && askIfNeeded) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return 'denied';
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: id })).data;
    await sendToken(token);
    return 'enabled';
  } catch (e) {
    console.warn('Push registration failed', e);
    return 'unavailable';
  }
}

export async function sendToken(token: string) {
  await api.post<void>('/me/push-tokens', { token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID' });
  registeredToken = token;
}

/** On logout: stop this device getting the account's notifications. Never blocks logout on failure. */
export async function unregisterPush() {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await api.post<void>('/me/push-tokens/remove', { token });
  } catch {
    // The server will drop the token once Expo reports it dead, or when another account registers it.
  }
}
