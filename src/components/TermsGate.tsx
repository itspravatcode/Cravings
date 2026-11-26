import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, useAcceptTerms } from '@/features/auth';
import { errorMessage, LEGAL_URLS } from '@/lib/api';
import { colors, font, spacing } from '@/lib/theme';
import { Button } from './Button';
import { Icon } from './Icon';

/** Shown instead of the app until the user accepts the current Terms (new version, or an older account). */
export function TermsGate() {
  const accept = useAcceptTerms();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.icon}><Icon name="shield-checkmark-outline" size={40} color={colors.primary} /></View>
        <Text style={font.title}>Before you continue</Text>
        <Text style={[font.body, { color: colors.textSecondary }]}>
          Please review and accept the Cravings Terms of Service and Privacy Policy. They include the community rules for groups and chat.
          There’s zero tolerance for harassment or objectionable content.
        </Text>
        <Button title="Read the Terms" variant="outline" size="sm" onPress={() => void Linking.openURL(LEGAL_URLS.terms)} />
        <Button title="Read the Privacy Policy" variant="outline" size="sm" onPress={() => void Linking.openURL(LEGAL_URLS.privacy)} />
        {accept.isError && <Text style={{ color: colors.danger }}>{errorMessage(accept.error)}</Text>}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button title="I agree" onPress={() => accept.mutate()} loading={accept.isPending} />
        <Button title="Log out" variant="ghost" onPress={() => void signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
