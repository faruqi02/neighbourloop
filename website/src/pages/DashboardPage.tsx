import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AdminStats } from '../types';
import { Users, Store, HeartHandshake, Recycle } from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  const cards = [
    { title: 'Jumlah Pengguna', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: 'Iklan Marketplace', value: stats.totalListings, icon: Store, color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Barang Derma', value: stats.donationItems, icon: Recycle, color: 'bg-amber-100 text-amber-600' },
    { title: 'Bantuan Kejiranan', value: stats.helpRequests, icon: HeartHandshake, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

