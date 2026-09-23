import { create } from 'zustand';
import { HelpRequest } from '../types';
import { apiRequest } from '../services/api';
import { useUserStore } from './useUserStore';

interface HelpState {
  requests: HelpRequest[];
  loading: boolean;
  fetchHelpRequests: () => Promise<void>;
  addRequest: (reqData: Omit<HelpRequest, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  deleteRequest: (id: string) => Promise<boolean>;
  fulfillRequest: (requestId: string, helperName: string) => Promise<boolean>;
}

export const useHelpStore = create<HelpState>((set) => ({
  requests: [],
  loading: false,

  fetchHelpRequests: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest<HelpRequest[]>('/help');
      if (data && Array.isArray(data)) {
        set({ requests: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      set({ loading: false });
    }
  },

  addRequest: async (reqData) => {
    const currentUser = useUserStore.getState().currentUser;
    const userId = currentUser ? currentUser.id : 'u1';

    const tempItem: HelpRequest = {
      ...reqData,
      id: `h_${Date.now()}`,
      status: 'Open',
      createdAt: 'Baru sahaja',
    };
    set((state) => ({ requests: [tempItem, ...state.requests] }));

    try {
      const saved = await apiRequest<HelpRequest>(`/help?user_id=${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          title: reqData.title,
          description: reqData.description,
          category: reqData.category,
          type: reqData.type,
          requesterPhone: reqData.requesterPhone,
          requesterContactNotes: reqData.requesterContactNotes,
          imageUrl: reqData.imageUrl,
        }),
      });

      if (saved) {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === tempItem.id ? saved : r)),
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  deleteRequest: async (id) => {
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== id),
    }));
    try {
      await apiRequest(`/help/${id}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      return false;
    }
  },

  fulfillRequest: async (requestId, helperName) => {
    set((state) => ({
      requests: state.requests.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: 'Completed', fulfilledBy: helperName };
        }
        return r;
      }),
    }));

    try {
      await apiRequest(`/help/${requestId}/fulfill`, { method: 'POST' });
      return true;
    } catch (e) {
      return false;
    }
  },
}));
