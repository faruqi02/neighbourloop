import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Recycle, Mail, Key, LogIn, Activity } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Kombinasi emel dan kata laluan salah.');
      }
      
      const userData = await res.json();
      login(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal menyambung ke pelayan (server).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/20">
            <Recycle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">NeighbourLoop</h1>
          <p className="text-gray-500 font-medium mt-1">Sistem Pentadbiran (Admin)</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center mb-4 border border-red-100">
              {error}
            </div>
          ) : null}

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
              Emel atau No. Telefon
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="admin@neighbourloop.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
              Kata Laluan
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Masukkan kata laluan..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-colors flex items-center justify-center shadow-lg shadow-emerald-600/30"
          >
            {loading ? (
              <Activity className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={18} className="mr-2" />
                Log Masuk Sistem
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Belum mempunyai akaun?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

