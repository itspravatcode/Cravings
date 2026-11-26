import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useUnreadCount } from '@/features/activity';
import { useChatUnread } from '@/features/chat';
import { colors, shadow } from '@/lib/theme';

function tabIcon(outline: IconName, filled: IconName) {
  return function TabIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
    return <Icon name={focused ? filled : outline} size={24} color={color as string} />;
  };
}

export default function TabsLayout() {
  const { data: unread } = useUnreadCount();
  const { data: chat } = useChatUnread();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: tabIcon('people-outline', 'people'),
          tabBarBadge: chat?.total ? (chat.total > 99 ? '99+' : chat.total) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: () => (
            <View style={styles.create}>
              <Icon name="add" size={26} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: tabIcon('notifications-outline', 'notifications'),
          tabBarBadge: unread ? (unread > 9 ? '9+' : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  create: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: -6, ...shadow, shadowOpacity: 0.25,
  },
});
