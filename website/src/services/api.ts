import { AdminStats, User } from '../types';

const API_URL = `http://${window.location.hostname}:8000`;

export const api = {
  getStats: async (): Promise<AdminStats> => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return {
        totalUsers: data.totalUsers,
        activeUsers: data.totalUsers, // Approximation based on total
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
  }
};
