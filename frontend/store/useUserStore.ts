import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { mockUsers } from '../services/mockData';

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
  deleteUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: 'Aktif' | 'Digantung') => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
  currentUser: null,
  allUsers: mockUsers,

  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  switchUserById: (userId) => set((state) => {
    const target = state.allUsers.find((u) => u.id === userId);
    return target ? { currentUser: target } : {};
  }),

  updateLocation: (location, radiusKm, lat, lng) => set((state) => {
    if (!state.currentUser) return {};
    const updated = {
      ...state.currentUser,
      location,
      radiusKm,
      lat: lat !== undefined ? lat : state.currentUser.lat,
      lng: lng !== undefined ? lng : state.currentUser.lng,
    };
    return {
      currentUser: updated,
      allUsers: state.allUsers.map((u) => (u.id === updated.id ? updated : u)),
    };
  }),

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
