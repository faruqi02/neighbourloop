import { create } from 'zustand';
import { HelpRequest } from '../types';
import { mockHelpRequests } from '../services/mockData';

interface HelpState {
  requests: HelpRequest[];
  addRequest: (reqData: Omit<HelpRequest, 'id' | 'status' | 'createdAt'>) => void;
  deleteRequest: (id: string) => void;
  fulfillRequest: (requestId: string, helperName: string) => void;
}

export const useHelpStore = create<HelpState>((set) => ({
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

  deleteRequest: (id) => set((state) => ({
    requests: state.requests.filter((r) => r.id !== id),
  })),

  fulfillRequest: (requestId, helperName) => {
    set((state) => ({
      requests: state.requests.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: 'Completed', fulfilledBy: helperName };
        }
        return r;
      }),
    }));
  },
}));
