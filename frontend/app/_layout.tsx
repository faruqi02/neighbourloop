import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import 'react-native-reanimated';
import '../global.css';
import { useUserStore } from '../store/useUserStore';
import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
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
  const { currentUser, updateLocation } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  // Auto-detect user GPS location and sync with database whenever user opens the app
  useEffect(() => {
    if (!currentUser?.id) return;

    let isMounted = true;

    const detectAndSyncLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        const currentLat = loc.coords.latitude;
        const currentLng = loc.coords.longitude;

        let detectedName = currentUser.location || 'Lokasi Semasa';
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: currentLat,
            longitude: currentLng,
          });
          if (geocode && geocode.length > 0) {
            const p = geocode[0];
            detectedName = p.district || p.city || p.subregion || p.region || currentUser.location || 'Lokasi Semasa';
          }
        } catch (geoErr) {
          // Keep existing or fallback name
        }

        if (!isMounted) return;

        // Auto update state and persist to database via updateLocation (which calls /users/profile)
        updateLocation(detectedName, currentUser.radiusKm || 5, currentLat, currentLng);
      } catch (err) {
        console.log('Auto location detection error:', err);
      }
    };

    detectAndSyncLocation();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        detectAndSyncLocation();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!segments) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!currentUser && !inAuthGroup) {
      router.replace('/login');
    } else if (currentUser && inAuthGroup) {
      router.replace('/(tabs)' as any);
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
