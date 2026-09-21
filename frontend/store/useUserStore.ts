import { create } from 'zustand';
import { User } from '../types';
import { mockUsers } from '../services/mockData';

interface UserState {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  logout: () => void;
  switchUserById: (userId: string) => void;
  updateLocation: (location: string, radiusKm: number) => void;
  updateContactDetails: (
    phone?: string,
    telegram?: string,
    contactNotes?: string,
    preferredContactMethod?: User['preferredContactMethod']
  ) => void;
  deleteUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: 'Aktif' | 'Digantung') => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  allUsers: mockUsers,

  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  switchUserById: (userId) => set((state) => {
    const target = state.allUsers.find((u) => u.id === userId);
    return target ? { currentUser: target } : {};
  }),

  updateLocation: (location, radiusKm) => set((state) => {
    const updated = {
      ...state.currentUser,
      location,
      radiusKm,
    };
    return {
      currentUser: updated,
      allUsers: state.allUsers.map((u) => (u.id === updated.id ? updated : u)),
    };
  }),

  updateContactDetails: (phone, telegram, contactNotes, preferredContactMethod) => set((state) => {
    const updated = {
      ...state.currentUser,
      phone: phone !== undefined ? phone : state.currentUser.phone,
      telegram: telegram !== undefined ? telegram : state.currentUser.telegram,
      contactNotes: contactNotes !== undefined ? contactNotes : state.currentUser.contactNotes,
      preferredContactMethod: preferredContactMethod !== undefined ? preferredContactMethod : state.currentUser.preferredContactMethod,
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
    currentUser: state.currentUser.id === userId ? { ...state.currentUser, status } : state.currentUser,
  })),
}));
