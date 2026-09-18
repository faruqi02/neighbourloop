export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  telegram_id?: string;
  neighborhood: string;
  radius_km: number;
  role: 'User' | 'Admin';
  status: 'Aktif' | 'Digantung';
}

export interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  seller_name: string;
}

export interface DonationItem {
  id?: string;
  title: string;
  description: string;
  status: string;
}

export interface HelpRequest {
  id?: string;
  title: string;
  description: string;
  status: string;
}

export interface CommunityNotice {
  id?: string;
  title: string;
  description: string;
  date: string;
}

export interface RecycleCenter {
  id?: string;
  name: string;
  address: string;
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

