import { create } from 'zustand';
import { HelpRequest } from '../types';
import { mockHelpRequests } from '../services/mockData';

interface HelpState {
  requests: HelpRequest[];
  addRequest: (req: HelpRequest) => void;
}

export const useHelpStore = create<HelpState>((set) => ({
  requests: mockHelpRequests,
  addRequest: (req) => set((state) => ({ requests: [req, ...state.requests] })),
}));
