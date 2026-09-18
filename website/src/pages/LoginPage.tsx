import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Recycle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    login('admin@neighbourloop.org');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mb-4">
            <Recycle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">NeighbourLoop</h1>
          <p className="text-gray-500 mt-2">Sistem Pentadbiran & Pemantauan</p>
        </div>

        <button
          onClick={handleDemoLogin}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Log Masuk Segera (Demo SV)
        </button>
      </div>
    </div>
  );
};

