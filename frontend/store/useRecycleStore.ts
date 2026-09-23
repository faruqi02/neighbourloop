import { create } from 'zustand';
import { RecycleCenter, DonationItem, SmartRecommendation } from '../types';
import { apiRequest } from '../services/api';
import { useUserStore } from './useUserStore';

interface RecycleState {
  centers: RecycleCenter[];
  donations: DonationItem[];
  loading: boolean;
  fetchRecycleData: () => Promise<void>;
  addDonation: (donationData: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  deleteDonation: (id: string) => Promise<boolean>;
  claimDonation: (donationId: string, claimerName: string) => Promise<boolean>;
  getSmartRecommendation: (
    itemName: string,
    category: string,
    condition: 'Masih elok' | 'Rosak / Tidak Berfungsi'
  ) => SmartRecommendation;
}

export const useRecycleStore = create<RecycleState>((set, get) => ({
  centers: [],
  donations: [],
  loading: false,

  fetchRecycleData: async () => {
    set({ loading: true });
    try {
      const [fetchedCenters, fetchedDonations] = await Promise.all([
        apiRequest<RecycleCenter[]>('/recycle/centers'),
        apiRequest<DonationItem[]>('/recycle/donations'),
      ]);

      set({
        centers: fetchedCenters && Array.isArray(fetchedCenters) ? fetchedCenters : [],
        donations: fetchedDonations && Array.isArray(fetchedDonations) ? fetchedDonations : [],
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
    }
  },

  addDonation: async (donationData) => {
    const currentUser = useUserStore.getState().currentUser;
    const userId = currentUser ? currentUser.id : 'u1';

    const tempItem: DonationItem = {
      ...donationData,
      id: `d_${Date.now()}`,
      status: 'Available',
      createdAt: 'Baru sahaja',
    };
    set((state) => ({ donations: [tempItem, ...state.donations] }));

    try {
      const saved = await apiRequest<DonationItem>(`/recycle/donations?user_id=${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          title: donationData.title,
          description: donationData.description,
          category: donationData.category,
          imageUrl: donationData.imageUrl,
          donorPhone: donationData.donorPhone,
          donorContactNotes: donationData.donorContactNotes,
        }),
      });

      if (saved) {
        set((state) => ({
          donations: state.donations.map((item) => (item.id === tempItem.id ? saved : item)),
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  deleteDonation: async (id) => {
    set((state) => ({
      donations: state.donations.filter((item) => item.id !== id),
    }));
    try {
      await apiRequest(`/recycle/donations/${id}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      return false;
    }
  },

  claimDonation: async (donationId, claimerName) => {
    set((state) => ({
      donations: state.donations.map((item) =>
        item.id === donationId
          ? { ...item, status: 'Claimed', claimedBy: claimerName }
          : item
      ),
    }));

    try {
      await apiRequest(`/recycle/donations/${donationId}/claim?claimer_name=${encodeURIComponent(claimerName)}`, {
        method: 'POST',
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  getSmartRecommendation: (itemName, category, condition) => {
    const { centers } = get();
    const isGood = condition === 'Masih elok';
    const catLower = category.toLowerCase();
    const itemLower = itemName.toLowerCase();

    if (isGood) {
      const ngos = centers.filter((c) => c.type === 'NGO');
      return {
        decision: 'Derma',
        title: 'Cadangan Pintar: Sesuai untuk Didermakan atau Dijual',
        explanation: `Barang "${itemName}" masih dalam keadaan elok! Mengikut amalan kelestarian komuniti, barangan elok disyorkan untuk digunakan semula melalui derma komuniti atau jualan preloved sebelum dilupuskan.`,
        suggestedActions: ['NGO', 'Komuniti', 'Marketplace'],
        matchingCenters: ngos,
      };
    } else {
      const recycleCenters = centers.filter((c) => c.type === 'RecycleCenter');
      let explanation = `Barang "${itemName}" yang rosak boleh dihantar ke pusat kitar semula untuk diproses menjadi bahan mentah baharu.`;

      if (catLower.includes('e-waste') || catLower.includes('elektronik') || itemLower.includes('telefon') || itemLower.includes('kabel')) {
        explanation = `Barang "${itemName}" mengandungi komponen E-Waste berbahaya. Hantar ke fasiliti pemulihan berdaftar untuk mengelakkan pencemaran toksik dan menyelamatkan logam berharga.`;
      }

      return {
        decision: 'Recycle',
        title: 'Cadangan Pintar: Hantar ke Pusat Kitar Semula',
        explanation,
        suggestedActions: ['RecycleCenter'],
        matchingCenters: recycleCenters,
      };
    }
  },
}));
