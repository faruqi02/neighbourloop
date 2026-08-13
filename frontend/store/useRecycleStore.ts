import { create } from 'zustand';
import { RecycleCenter } from '../types';
import { mockRecycleCenters } from '../services/mockData';

interface RecycleState {
  centers: RecycleCenter[];
  getRuleEngineSuggestion: (condition: string) => 'Derma' | 'Recycle';
}

export const useRecycleStore = create<RecycleState>((set) => ({
  centers: mockRecycleCenters,
  getRuleEngineSuggestion: (condition: string) => {
    if (condition === 'Masih elok') return 'Derma';
    return 'Recycle';
  }
}));
