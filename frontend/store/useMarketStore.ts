import { create } from 'zustand';
import { Listing } from '../types';
import { mockListings } from '../services/mockData';

interface MarketState {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => void;
  filterListings: (category: string, search: string, maxDistance?: number) => Listing[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  listings: mockListings,
  
  addListing: (listingData) => set((state) => {
    const newListing: Listing = {
      ...listingData,
      id: `l_${Date.now()}`,
      createdAt: 'Baru sahaja',
    };
    return { listings: [newListing, ...state.listings] };
  }),

  filterListings: (category, search, maxDistance) => {
    const { listings } = get();
    return listings.filter((item) => {
      const matchCat = category === 'Semua' || item.category === category;
      const matchSearch = !search || 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchDist = maxDistance ? item.distance <= maxDistance : true;
      return matchCat && matchSearch && matchDist;
    });
  },
}));
