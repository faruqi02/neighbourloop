import { create } from 'zustand';
import { CommunityNotice } from '../types';
import { apiRequest } from '../services/api';

interface NoticeState {
  notices: CommunityNotice[];
  selectedCategory: string;
  loading: boolean;
  fetchNotices: () => Promise<void>;
  setSelectedCategory: (cat: string) => void;
  addNotice: (notice: Omit<CommunityNotice, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteNotice: (id: string) => Promise<boolean>;
}

export const useNoticeStore = create<NoticeState>((set) => ({
  notices: [],
  selectedCategory: 'Semua',
  loading: false,

  fetchNotices: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest<CommunityNotice[]>('/notices');
      if (data && Array.isArray(data)) {
        set({ notices: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  addNotice: async (noticeData) => {
    const tempNotice: CommunityNotice = {
      ...noticeData,
      id: `not_${Date.now()}`,
      createdAt: 'Baru sahaja',
    };
    set((state) => ({ notices: [tempNotice, ...state.notices] }));

    try {
      const saved = await apiRequest<CommunityNotice>('/notices', {
        method: 'POST',
        body: JSON.stringify(noticeData),
      });
      if (saved) {
        set((state) => ({
          notices: state.notices.map((n) => (n.id === tempNotice.id ? saved : n)),
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  deleteNotice: async (id) => {
    set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
    try {
      await apiRequest(`/notices/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  },
}));
