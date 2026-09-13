import { create } from 'zustand';
import { RecycleCenter, DonationItem, SmartRecommendation } from '../types';
import { mockRecycleCenters, mockDonations } from '../services/mockData';

interface RecycleState {
  centers: RecycleCenter[];
  donations: DonationItem[];
  addDonation: (donationData: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) => void;
  claimDonation: (donationId: string, claimerName: string) => void;
  getSmartRecommendation: (
    itemName: string,
    category: string,
    condition: 'Masih elok' | 'Rosak / Tidak Berfungsi'
  ) => SmartRecommendation;
}

export const useRecycleStore = create<RecycleState>((set, get) => ({
  centers: mockRecycleCenters,
  donations: mockDonations,

  addDonation: (donationData) => set((state) => {
    const newItem: DonationItem = {
      ...donationData,
      id: `d_${Date.now()}`,
      status: 'Available',
      createdAt: 'Baru sahaja',
    };
    return { donations: [newItem, ...state.donations] };
  }),

  claimDonation: (donationId, claimerName) => set((state) => ({
    donations: state.donations.map((item) =>
      item.id === donationId
        ? { ...item, status: 'Claimed', claimedBy: claimerName }
        : item
    ),
  })),

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
        explanation: `Barang "${itemName}" masih dalam keadaan elok! Mengikut prinsip Ekonomi Kitaran (SDG 12), barangan elok disyorkan untuk digunakan semula melalui derma komuniti atau jualan preloved sebelum dilupuskan.`,
        suggestedActions: ['NGO', 'Komuniti', 'Marketplace'],
        matchingCenters: ngos,
        potentialGreenPoints: 50,
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
        potentialGreenPoints: 30,
      };
    }
  },
}));
