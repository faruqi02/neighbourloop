import { AdminStats, User, Listing, DonationItem, HelpRequest, CommunityNotice, RecycleCenter } from '../types';

const API_URL = `http://${window.location.hostname}:8000`;

export const api = {
  getStats: async (): Promise<AdminStats> => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return {
        totalUsers: data.totalUsers,
        activeUsers: data.totalUsers,
        suspendedUsers: 0,
        marketplaceValue: 0,
        totalListings: data.totalListings,
        donationItems: data.totalDonations,
        helpRequests: data.totalHelpRequests,
        backendStatus: 'Online'
      };
    } catch (e) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        marketplaceValue: 0,
        totalListings: 0,
        donationItems: 0,
        helpRequests: 0,
        backendStatus: 'Offline'
      };
    }
  },
  
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return data.filter((u: User) => u.id && u.id.trim() !== '');
    } catch (e) {
      console.error("Failed to fetch users", e);
      return [];
    }
  },

  createUser: async (user: any): Promise<User> => {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  updateUser: async (id: string, userData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  deleteUser: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  // --- Marketplace ---
  getListings: async (): Promise<Listing[]> => {
    try {
      const res = await fetch(`${API_URL}/marketplace`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch listings", e);
      return [];
    }
  },

  createListing: async (listing: any): Promise<Listing> => {
    const res = await fetch(`${API_URL}/marketplace?user_id=admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  deleteListing: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/marketplace/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  // --- Donate & Recycle ---
  getDonations: async (): Promise<DonationItem[]> => {
    try {
      const res = await fetch(`${API_URL}/recycle/donations`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch donations", e);
      return [];
    }
  },

  deleteDonation: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/recycle/donations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  getRecycleCenters: async (): Promise<RecycleCenter[]> => {
    try {
      const res = await fetch(`${API_URL}/recycle/centers`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch recycle centers", e);
      return [];
    }
  },

  // --- Help Nearby ---
  getHelpRequests: async (): Promise<HelpRequest[]> => {
    try {
      const res = await fetch(`${API_URL}/help`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch help requests", e);
      return [];
    }
  },

  createHelpRequest: async (help: any): Promise<HelpRequest> => {
    const res = await fetch(`${API_URL}/help?user_id=admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(help)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  deleteHelpRequest: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/help/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  fulfillHelpRequest: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/help/${id}/fulfill?helper_id=admin`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  // --- Community Notices ---
  getNotices: async (): Promise<CommunityNotice[]> => {
    try {
      const res = await fetch(`${API_URL}/notices`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch notices", e);
      return [];
    }
  },

  createNotice: async (notice: any): Promise<CommunityNotice> => {
    const res = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  deleteNotice: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/notices/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  }
};
