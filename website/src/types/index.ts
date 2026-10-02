export interface User {
  id?: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  neighborhood: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  radiusKm?: number;
  role: 'User' | 'Admin';
  status: 'Aktif' | 'Digantung';
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  imageUrl?: string;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerContactNotes?: string;
  distance?: number;
  createdAt?: string;
}

export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  donorId?: string;
  donorName?: string;
  donorPhone?: string;
  donorContactNotes?: string;
  distance?: number;
  status: 'Available' | 'Claimed' | string;
  claimedBy?: string;
  createdAt?: string;
}

export interface RecycleCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  distance?: number;
  contactPhone?: string;
  operatingHours?: string;
  typesAccepted?: string[];
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'Permintaan' | 'Tawaran' | string;
  distance?: number;
  requesterId?: string;
  requesterName?: string;
  requesterPhone?: string;
  requesterContactNotes?: string;
  imageUrl?: string;
  status: 'Open' | 'Completed' | string;
  fulfilledBy?: string;
  createdAt?: string;
}

export interface CommunityNotice {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  organizer: string;
  contactPerson?: string;
  isImportant?: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  marketplaceValue: number;
  totalListings: number;
  donationItems: number;
  helpRequests: number;
  backendStatus: 'Online' | 'Offline';
}

