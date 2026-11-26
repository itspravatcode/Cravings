import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { colors, spacing } from '@/lib/theme';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Icon name="fast-food" size={64} color={colors.primary} />
        </View>
        <Text style={styles.brand}>Cravings</Text>
        <Text style={styles.tagline}>Good snacks. Better company.</Text>
        <View style={styles.points}>
          {[
            ['calendar-outline', 'Plan snack breaks together'],
            ['bar-chart-outline', 'Vote on what to eat'],
            ['bag-handle-outline', "Ask for a pickup when someone's heading out"],
          ].map(([icon, text]) => (
            <View key={text} style={styles.point}>
              <Icon name={icon as 'calendar-outline'} size={18} color={colors.primaryDark} />
              <Text style={styles.pointText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="Create an account" onPress={() => router.push('/register')} />
        <Button title="I already have an account" variant="outline" onPress={() => router.push('/login')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  logo: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  brand: { fontSize: 44, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  tagline: { fontSize: 16, color: colors.textSecondary },
  points: { marginTop: spacing.xl, gap: spacing.md, alignSelf: 'stretch' },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  pointText: { fontSize: 14, color: colors.text, flex: 1 },
  actions: { gap: spacing.md },
});
