import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/features/auth';

type IconProps = { focused: boolean; color: any; size: number };

const TAB_ICONS: Record<string, string> = {
  index: '🍽️',
  groups: '👥',
  create: '➕',
  activity: '🔔',
  profile: '👤',
};

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated) {
    return null;
  }

  const icon = (name: string) => ({
    focused,
    color,
    size,
  }: IconProps) => (
    <Text style={{ color: focused ? colors.primary : String(color ?? '#94A3B8'), fontSize: size }}>
      {TAB_ICONS[name]}
    </Text>
  );

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: icon('index'),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          headerShown: false,
          tabBarIcon: icon('groups'),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          headerShown: false,
          tabBarIcon: icon('create'),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          headerShown: false,
          tabBarIcon: icon('activity'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: icon('profile'),
        }}
      />
    </Tabs>
  );
}