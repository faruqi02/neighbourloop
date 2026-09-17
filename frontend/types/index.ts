export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  telegram?: string;
  contactNotes?: string;
  preferredContactMethod?: 'Semua' | 'WhatsApp' | 'Telegram' | 'Panggilan' | 'Chat Aplikasi';
  location: string;
  radiusKm: number;
  avatarUrl?: string;
  role?: 'User' | 'Admin';
  status?: 'Aktif' | 'Digantung';
  joinedDate?: string;
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
  sellerPhone?: string;
  sellerContactNotes?: string;
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
  donorPhone?: string;
  donorContactNotes?: string;
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
  requesterPhone?: string;
  requesterContactNotes?: string;
  imageUrl?: string;
  status: 'Open' | 'Completed';
  fulfilledBy?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantPhone?: string;
  itemContextTitle?: string;
  itemContextPrice?: number;
  itemContextCategory?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  messages: ChatMessage[];
}

export interface CommunityNotice {
  id: string;
  title: string;
  category: 'Gotong-Royong' | 'Penyelenggaraan' | 'Keselamatan' | 'Hebahan' | 'Aktiviti Komuniti';
  description: string;
  date: string;
  time?: string;
  location: string;
  organizer: string;
  contactPerson?: string;
  isImportant?: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface SmartRecommendation {
  decision: 'Derma' | 'Recycle' | 'Jual';
  title: string;
  explanation: string;
  suggestedActions: ('Marketplace' | 'NGO' | 'Komuniti' | 'RecycleCenter')[];
  matchingCenters: RecycleCenter[];
}
