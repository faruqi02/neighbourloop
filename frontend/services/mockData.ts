import { Listing, RecycleCenter, HelpRequest, User } from '../types';

export const mockUser: User = {
  id: 'u1',
  name: 'Aisyah',
  email: 'aisyah@example.com',
  location: 'Taman Melati, Johor Bahru',
  greenPoints: 120,
};

export const mockListings: Listing[] = [
  {
    id: 'l1',
    title: 'Meja Belajar',
    description: 'Kayu',
    price: 40,
    category: 'Perabot',
    distance: 1.2,
    imageUrl: 'https://via.placeholder.com/150',
    sellerId: 'u2',
  },
  {
    id: 'l2',
    title: 'Basikal',
    description: '26 Inci',
    price: 120,
    category: 'Semua', // Just as an example, maybe categorised as Lain-lain normally
    distance: 2.2,
    imageUrl: 'https://via.placeholder.com/150',
    sellerId: 'u3',
  },
  {
    id: 'l3',
    title: 'Kipas Elektrik',
    description: 'Berfungsi dengan baik',
    price: 30,
    category: 'Elektronik',
    distance: 1.5,
    imageUrl: 'https://via.placeholder.com/150',
    sellerId: 'u4',
  },
  {
    id: 'l4',
    title: 'Beg Sekolah',
    description: 'Warna biru',
    price: 25,
    category: 'Pakaian', // Assuming bags go here based on UI
    distance: 1.0,
    imageUrl: 'https://via.placeholder.com/150',
    sellerId: 'u5',
  },
];

export const mockRecycleCenters: RecycleCenter[] = [
  {
    id: 'r1',
    name: 'Pusat Kitar Semula Taman Perling',
    address: 'Jalan Camar 1, Taman Perling',
    distance: 1.6,
    operatingHours: '8:00 AM - 6:00 PM',
    coordinates: { lat: 1.493, lng: 103.684 },
    typesAccepted: ['Elektronik', 'Plastik', 'Kaca', 'Kertas', 'Logam'],
  },
];

export const mockHelpRequests: HelpRequest[] = [
  {
    id: 'h1',
    title: 'Perlukan bantuan angkat barang',
    distance: 0.5,
    type: 'Permintaan',
    requesterId: 'u6',
    status: 'Open',
  },
  {
    id: 'h2',
    title: 'Pinjam gerudi elektrik (1-3 hari)',
    distance: 1.3,
    type: 'Permintaan',
    requesterId: 'u7',
    status: 'Open',
  },
  {
    id: 'h3',
    title: 'Tawaran: Hantar barang ke pos',
    distance: 2.0,
    type: 'Tawaran',
    requesterId: 'u8',
    status: 'Open',
  },
];
