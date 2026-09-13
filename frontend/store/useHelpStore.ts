import { create } from 'zustand';
import { HelpRequest } from '../types';
import { mockHelpRequests } from '../services/mockData';

interface HelpState {
  requests: HelpRequest[];
  addRequest: (reqData: Omit<HelpRequest, 'id' | 'status' | 'createdAt'>) => void;
  fulfillRequest: (requestId: string, helperName: string) => number;
}

export const useHelpStore = create<HelpState>((set, get) => ({
  requests: mockHelpRequests,

  addRequest: (reqData) => set((state) => {
    const newItem: HelpRequest = {
      ...reqData,
      id: `h_${Date.now()}`,
      status: 'Open',
      createdAt: 'Baru sahaja',
    };
    return { requests: [newItem, ...state.requests] };
  }),

  fulfillRequest: (requestId, helperName) => {
    let points = 20;
    set((state) => ({
      requests: state.requests.map((r) => {
        if (r.id === requestId) {
          points = r.rewardPoints;
          return { ...r, status: 'Completed', fulfilledBy: helperName };
        }
        return r;
      }),
    }));
    return points;
  },
}));
