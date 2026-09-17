import { create } from 'zustand';
import { CommunityNotice } from '../types';
import { mockCommunityNotices } from '../services/mockData';

interface NoticeState {
  notices: CommunityNotice[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  addNotice: (notice: Omit<CommunityNotice, 'id' | 'createdAt'>) => void;
  deleteNotice: (id: string) => void;
}

export const useNoticeStore = create<NoticeState>((set) => ({
  notices: mockCommunityNotices,
  selectedCategory: 'Semua',

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  addNotice: (noticeData) => {
    const newNotice: CommunityNotice = {
      ...noticeData,
      id: `not_${Date.now()}`,
      createdAt: 'Baru sahaja',
    };
    set((state) => ({ notices: [newNotice, ...state.notices] }));
  },

  deleteNotice: (id) => {
    set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
  },
}));
