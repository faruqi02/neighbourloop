import { Tabs } from 'expo-router';
import { Home, List, Recycle, HeartHandshake, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a', // green-600
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recycle"
        options={{
          title: 'Recycle',
          tabBarIcon: ({ color }) => <Recycle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help Nearby',
          tabBarIcon: ({ color }) => <HeartHandshake size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
