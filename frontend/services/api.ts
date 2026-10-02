// API Client for NeighbourLoop Backend
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Mendapatkan URL asas Backend secara dinamik:
 * 1. Jika Web: Menggunakan hostname pelayar semasa (port 8000).
 * 2. Jika Expo (Peranti Fizikal / Emulator): Mengesan IP mesin hos dari debuggerHost / hostUri.
 * 3. Fallback jika offline / standalone: IP rangkaian setempat lalai (192.168.1.165).
 */
export function getApiBaseUrl(): string {
  // 1. Semak jika terdapat konfigurasi eksplisit dalam extra
  const extraUrl = (Constants.expoConfig?.extra as any)?.backendUrl;
  if (extraUrl) {
    return extraUrl;
  }

  // 2. Persekitaran Web (Browser)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000`;
    }
    return 'http://127.0.0.1:8000';
  }

  // 3. Kesan IP Komputer Hos dari Expo Packager
  const hostUri = Constants.expoConfig?.hostUri 
    || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost
    || (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // 4. Default fallback
  return 'http://192.168.0.216:8000';
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for Google Apps Script

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn(`[API] Ralat panggilan ke ${baseUrl}${endpoint}:`, err);
    // Fallback smoothly to offline state
    return null;
  }
}
