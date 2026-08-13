export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  greenPoints: number;
  avatarUrl?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Semua' | 'Perabot' | 'Elektronik' | 'Pakaian';
  distance: number;
  imageUrl: string;
  sellerId: string;
}

export interface RecycleCenter {
  id: string;
  name: string;
  address: string;
  distance: number;
  operatingHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  typesAccepted: string[];
}

export interface HelpRequest {
  id: string;
  title: string;
  distance: number;
  type: 'Permintaan' | 'Tawaran';
  requesterId: string;
  status: 'Open' | 'Completed';
}
