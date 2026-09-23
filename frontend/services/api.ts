// API Client for NeighbourLoop Backend
import Constants from 'expo-constants';

// Dapat IP peranti host secara automatik menggunakan expo-constants
let API_BASE_URL = 'http://192.168.1.165:8000'; // Default fallback

const debuggerHost = Constants.expoConfig?.hostUri;
if (debuggerHost) {
  const ip = debuggerHost.split(':')[0];
  API_BASE_URL = `http://${ip}:8000`;
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for Google Apps Script

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  } catch {
    // Fallback smoothly to offline state
    return null;
  }
}

