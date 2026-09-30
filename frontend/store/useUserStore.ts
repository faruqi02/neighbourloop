import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { mockUsers } from '../services/mockData';
import { apiRequest } from '../services/api';

interface UserState {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  logout: () => void;
  switchUserById: (userId: string) => void;
  updateLocation: (location: string, radiusKm: number, lat?: number, lng?: number) => void;
  updateContactDetails: (
    phone?: string,
    username?: string
  ) => void;
  updateProfile: (profileData: {
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    location?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    avatarUrl?: string;
    avatarBase64?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  deleteUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: 'Aktif' | 'Digantung') => void;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
  currentUser: null,
  allUsers: mockUsers,

  fetchUsers: async () => {
    try {
      const data = await apiRequest<any[]>('/admin/users');
      if (Array.isArray(data) && data.length > 0) {
        const formattedUsers: User[] = data.map((u) => ({
          id: u.id,
          name: u.name || '',
          username: u.username || (u.email ? u.email.split('@')[0] : ''),
          email: u.email || '',
          phone: u.phone ? String(u.phone).replace(/^'/, '') : '',
          location: u.neighborhood || u.location || '',
          lat: u.lat ? Number(u.lat) : undefined,
          lng: u.lng ? Number(u.lng) : undefined,
          radiusKm: u.radiusKm ? Number(u.radiusKm) : 5,
          avatarUrl: u.avatarUrl,
          role: u.role || 'User',
          status: u.status || 'Aktif',
          joinedDate: u.createdAt,
        }));
        const existingIds = new Set(formattedUsers.map((u) => u.id));
        const merged = [...formattedUsers, ...mockUsers.filter((m) => !existingIds.has(m.id))];
        set({ allUsers: merged });
      }
    } catch (e) {
      console.warn('Failed to fetch real users in store:', e);
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  switchUserById: (userId) => set((state) => {
    const target = state.allUsers.find((u) => u.id === userId);
    return target ? { currentUser: target } : {};
  }),

  updateLocation: (location, radiusKm, lat, lng) => {
    const current = get().currentUser;
    const finalLat = lat !== undefined ? lat : current?.lat;
    const finalLng = lng !== undefined ? lng : current?.lng;

    set((state) => {
      if (!state.currentUser) return {};
      const updated = {
        ...state.currentUser,
        location,
        radiusKm,
        lat: finalLat,
        lng: finalLng,
      };
      return {
        currentUser: updated,
        allUsers: state.allUsers.map((u) => (u.id === updated.id ? updated : u)),
      };
    });

    // Also persist to backend DB
    if (current?.id) {
      get().updateProfile({
        location,
        radiusKm,
        lat: finalLat,
        lng: finalLng,
      }).catch((err) => console.warn('Sync location to backend failed:', err));
    }
  },

  updateContactDetails: (phone, username) => set((state) => {
    if (!state.currentUser) return {};
    const updated = {
      ...state.currentUser,
      phone: phone !== undefined ? phone : state.currentUser.phone,
      username: username !== undefined ? username : state.currentUser.username,
    };
    return {
      currentUser: updated,
      allUsers: state.allUsers.map((u) => (u.id === updated.id ? updated : u)),
    };
  }),

  updateProfile: async (profileData) => {
    const current = get().currentUser;
    if (!current) return { success: false, message: 'Pengguna tidak dijumpai' };

    const updatedUser: User = {
      ...current,
      name: profileData.name !== undefined && profileData.name.trim() !== '' ? profileData.name.trim() : current.name,
      username: profileData.username !== undefined ? profileData.username.trim().replace(/^@/, '') : current.username,
      email: profileData.email !== undefined && profileData.email.trim() !== '' ? profileData.email.trim() : current.email,
      phone: profileData.phone !== undefined ? profileData.phone.trim() : current.phone,
      location: profileData.location !== undefined && profileData.location.trim() !== '' ? profileData.location.trim() : current.location,
      lat: profileData.lat !== undefined ? profileData.lat : current.lat,
      lng: profileData.lng !== undefined ? profileData.lng : current.lng,
      radiusKm: profileData.radiusKm !== undefined ? profileData.radiusKm : current.radiusKm,
      avatarUrl: profileData.avatarUrl !== undefined && profileData.avatarUrl ? profileData.avatarUrl : current.avatarUrl,
    };

    set((state) => ({
      currentUser: updatedUser,
      allUsers: state.allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));

    try {
      const payload = {
        user_id: current.id,
        name: profileData.name?.trim(),
        username: profileData.username?.trim().replace(/^@/, ''),
        email: profileData.email?.trim(),
        phone: profileData.phone?.trim(),
        location: profileData.location?.trim(),
        lat: profileData.lat,
        lng: profileData.lng,
        radiusKm: profileData.radiusKm,
        avatarUrl: profileData.avatarUrl,
        avatarBase64: profileData.avatarBase64,
        newPassword: profileData.newPassword,
      };

      const result = await apiRequest<User>('/users/update-profile', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result && result.id) {
        set((state) => ({
          currentUser: { ...updatedUser, ...result },
          allUsers: state.allUsers.map((u) => (u.id === result.id ? { ...updatedUser, ...result } : u)),
        }));
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Sync profile to backend error (kept local):', e);
      return { success: true, message: 'Profil dikemaskini secara lokal.' };
    }
  },

  deleteUser: (userId) => set((state) => ({
    allUsers: state.allUsers.filter((u) => u.id !== userId),
  })),

  updateUserStatus: (userId, status) => set((state) => ({
    allUsers: state.allUsers.map((u) => (u.id === userId ? { ...u, status } : u)),
    currentUser: state.currentUser?.id === userId ? { ...state.currentUser, status } : state.currentUser,
  })),
    }),
    {
      name: 'neighbourloop-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentUser: state.currentUser }), // Only persist currentUser
    }
  )
);
