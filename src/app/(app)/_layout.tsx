import { Stack } from 'expo-router';
import { useChatConnection } from '@/features/chat';
import { usePushNotifications } from '@/features/notifications';
import { useMe } from '@/features/auth';
import { TermsGate } from '@/components/TermsGate';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

export default function AppLayout() {
  useChatConnection();
  usePushNotifications();
  useMe(); // keeps the cached profile (and termsAccepted) fresh
  const termsAccepted = useSession((s) => s.user?.termsAccepted);
  if (termsAccepted === false) return <TermsGate />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
