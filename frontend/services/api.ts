// API Client for NeighbourLoop Backend
const API_BASE_URL = 'http://127.0.0.1:8000';

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for mobile

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

