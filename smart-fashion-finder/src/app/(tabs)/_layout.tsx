import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { he } from '@/i18n/he';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#F3EEE6' },
        headerTintColor: '#12161C',
        headerTitleStyle: {
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 20,
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#1F6B63',
        tabBarInactiveTintColor: '#5C6675',
        tabBarStyle: {
          backgroundColor: '#FAF7F2',
          borderTopColor: '#E4DDD2',
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
        },
        sceneStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: he.tabs.discover,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="avatar"
        options={{
          title: he.tabs.avatar,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="body-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: he.tabs.history,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
