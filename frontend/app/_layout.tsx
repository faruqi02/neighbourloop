import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser } = require('../store/useUserStore').useUserStore();
  const segments = require('expo-router').useSegments();
  const router = require('expo-router').useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!currentUser && !inAuthGroup) {
      router.replace('/login');
    } else if (currentUser && inAuthGroup) {
      router.replace('/(tabs)/');
    }
  }, [currentUser, segments]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="marketplace" options={{ headerShown: false }} />
      <Stack.Screen name="recycle" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
