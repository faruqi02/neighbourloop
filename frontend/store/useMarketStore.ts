import { create } from 'zustand';
import { Listing } from '../types';
import { apiRequest } from '../services/api';
import { useUserStore } from './useUserStore';

interface MarketState {
  listings: Listing[];
  loading: boolean;
  fetchListings: () => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'> & { imageBase64?: string }) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  filterListings: (category: string, search: string, maxDistance?: number) => Listing[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  listings: [],
  loading: false,

  fetchListings: async () => {
    set({ loading: true });
    try {
      const currentUser = useUserStore.getState().currentUser;
      let url = '/marketplace';
      if (currentUser?.lat != null && currentUser?.lng != null) {
        url += `?user_lat=${currentUser.lat}&user_lng=${currentUser.lng}`;
      }
      const data = await apiRequest<Listing[]>(url);
      if (data && Array.isArray(data)) {
        set({ listings: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      set({ loading: false });
    }
  },

  addListing: async (listingData) => {
    const currentUser = useUserStore.getState().currentUser;
    const userId = currentUser ? currentUser.id : 'u1';
    const sellerUsername = (listingData.sellerName || currentUser?.username || currentUser?.name || 'Jiran').replace(/^@/, '');
    const finalLat = listingData.lat ?? currentUser?.lat;
    const finalLng = listingData.lng ?? currentUser?.lng;

    // Optimistic UI update
    const tempListing: Listing = {
      ...listingData,
      lat: finalLat,
      lng: finalLng,
      sellerName: sellerUsername,
      sellerId: userId,
      id: `l_${Date.now()}`,
      createdAt: 'Baru sahaja',
    };
    set((state) => ({ listings: [tempListing, ...state.listings] }));

    try {
      const saved = await apiRequest<Listing>(`/marketplace?user_id=${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          category: listingData.category,
          condition: listingData.condition,
          imageUrl: listingData.imageUrl,
          imageBase64: listingData.imageBase64,
          sellerId: userId,
          sellerName: sellerUsername,
          sellerPhone: listingData.sellerPhone,
          sellerContactNotes: listingData.sellerContactNotes,
          lat: finalLat,
          lng: finalLng,
        }),
      });

      if (saved) {
        set((state) => ({
          listings: state.listings.map((item) => (item.id === tempListing.id ? saved : item)),
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  deleteListing: async (id) => {
    set((state) => ({
      listings: state.listings.filter((item) => item.id !== id),
    }));
    try {
      await apiRequest(`/marketplace/${id}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      return false;
    }
  },

  filterListings: (category, search, maxDistance) => {
    const { listings } = get();
    return listings.filter((item) => {
      const matchCat = category === 'Semua' || item.category === category;
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchDist = maxDistance ? item.distance <= maxDistance : true;
      return matchCat && matchSearch && matchDist;
    });
  },
}));
