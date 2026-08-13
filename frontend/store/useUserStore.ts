import { create } from 'zustand';
import { User } from '../types';
import { mockUser } from '../services/mockData';

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  addGreenPoints: (points: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: mockUser, // Auto-login with mock user for testing
  setCurrentUser: (user) => set({ currentUser: user }),
  addGreenPoints: (points) => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, greenPoints: state.currentUser.greenPoints + points } : null
  })),
}));
