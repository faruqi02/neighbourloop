import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Activity } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'Online' | 'Offline'>('Offline');

  useEffect(() => {
    const fetchStatus = async () => {
      const stats = await api.getStats();
      setBackendStatus(stats.backendStatus);
    };
    fetchStatus();
  }, []);

  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <Activity size={20} className={backendStatus === 'Online' ? 'text-emerald-500' : 'text-red-500'} />
        <span className="text-sm font-medium text-gray-500">
          Backend API: <span className={backendStatus === 'Online' ? 'text-emerald-600' : 'text-red-600'}>{backendStatus}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
          {user?.name?.charAt(0)}
        </div>
      </div>
    </div>
  );
};

