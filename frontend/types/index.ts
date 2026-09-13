export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  radiusKm: number;
  greenPoints: number;
  avatarUrl?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Semua' | 'Perabot' | 'Elektronik' | 'Pakaian' | 'Lain-lain';
  condition: 'Baru' | 'Seperti Baru' | 'Terpakai';
  distance: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
}

export interface RecycleCenter {
  id: string;
  name: string;
  type: 'RecycleCenter' | 'NGO';
  address: string;
  distance: number;
  operatingHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  typesAccepted: string[];
  contactPhone?: string;
}

export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  donorId: string;
  donorName: string;
  distance: number;
  status: 'Available' | 'Claimed';
  claimedBy?: string;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: 'Pinjam Barang' | 'Khidmat/Tenaga' | 'Kemahiran' | 'Lain-lain';
  distance: number;
  type: 'Permintaan' | 'Tawaran';
  requesterId: string;
  requesterName: string;
  status: 'Open' | 'Completed';
  fulfilledBy?: string;
  rewardPoints: number;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  pointsEarned: number;
  category: 'marketplace' | 'recycle' | 'help' | 'donation';
}

export interface SmartRecommendation {
  decision: 'Derma' | 'Recycle' | 'Jual';
  title: string;
  explanation: string;
  suggestedActions: ('Marketplace' | 'NGO' | 'Komuniti' | 'RecycleCenter')[];
  matchingCenters: RecycleCenter[];
  potentialGreenPoints: number;
}
