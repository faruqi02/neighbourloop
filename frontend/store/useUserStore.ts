import { create } from 'zustand';
import { User, ActivityItem } from '../types';
import { mockUsers, mockActivities } from '../services/mockData';

interface UserState {
  currentUser: User;
  allUsers: User[];
  activities: ActivityItem[];
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  updateLocation: (location: string, radiusKm: number) => void;
  addGreenPoints: (points: number, reasonTitle?: string, reasonDesc?: string, category?: ActivityItem['category']) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: mockUsers[0],
  allUsers: mockUsers,
  activities: mockActivities,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  switchUserById: (userId) => set((state) => {
    const target = state.allUsers.find((u) => u.id === userId);
    return target ? { currentUser: target } : {};
  }),

  updateLocation: (location, radiusKm) => set((state) => ({
    currentUser: {
      ...state.currentUser,
      location,
      radiusKm,
    },
  })),

  addGreenPoints: (points, reasonTitle, reasonDesc, category = 'recycle') => set((state) => {
    const updatedUser = {
      ...state.currentUser,
      greenPoints: state.currentUser.greenPoints + points,
    };

    let updatedActivities = state.activities;
    if (reasonTitle) {
      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        title: reasonTitle,
        description: reasonDesc || `Mendapat +${points} Mata Hijau`,
        timestamp: 'Baru sahaja',
        pointsEarned: points,
        category,
      };
      updatedActivities = [newActivity, ...state.activities];
    }

    return {
      currentUser: updatedUser,
      activities: updatedActivities,
    };
  }),
}));
