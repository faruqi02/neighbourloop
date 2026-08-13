import { create } from 'zustand';
import { Listing } from '../types';
import { mockListings } from '../services/mockData';

interface MarketState {
  listings: Listing[];
  addListing: (listing: Listing) => void;
  filterByCategory: (category: string) => Listing[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  listings: mockListings,
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
  filterByCategory: (category) => {
    const { listings } = get();
    if (category === 'Semua') return listings;
    return listings.filter(l => l.category === category);
  }
}));
