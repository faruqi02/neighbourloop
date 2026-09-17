import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Home, List, HeartHandshake, User } from 'lucide-react-native';

const recycleIcon = require('../../images/recycle_icon.png');

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
          title: 'Donate & Recycle',
          tabBarIcon: ({ focused }) => (
            <Image
              source={recycleIcon}
              style={{ width: 26, height: 26, opacity: focused ? 1 : 0.6 }}
              resizeMode="contain"
            />
          ),
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
