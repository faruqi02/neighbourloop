import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Recycle, Mail, Key, UserPlus, Activity, User, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = name && email && location && password && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Sila isi semua maklumat yang diperlukan dengan betul.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          phone: '', 
          location, 
          password 
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errorMessage = 'Gagal mendaftar.';
        if (Array.isArray(errData.detail)) {
           errorMessage = "Maklumat tidak lengkap atau salah format.";
        } else if (errData.detail) {
           errorMessage = errData.detail;
        }
        throw new Error(errorMessage);
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
          <h1 className="text-2xl font-black text-gray-900">Daftar Akaun</h1>
          <p className="text-gray-500 font-medium mt-1 text-center">Sertai NeighbourLoop dan mulakan kelestarian di kawasan kejiranan anda.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center mb-4 border border-red-100">
              {error}
            </div>
          ) : null}

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
              Nama Penuh
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Contoh: Ahmad Ali"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
              Alamat Emel
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="ahmad@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
              Kawasan Kejiranan
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Contoh: Taman Universiti"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                placeholder="Minimum 6 aksara..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full font-bold py-3.5 px-4 rounded-2xl transition-colors flex items-center justify-center shadow-lg ${
              loading || !isFormValid
                ? 'bg-emerald-200 text-emerald-800 shadow-transparent cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {loading ? (
              <Activity className="animate-spin" size={20} />
            ) : (
              <>
                <UserPlus size={18} className="mr-2" />
                Daftar Akaun
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Sudah mempunyai akaun?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold">
            Log Masuk
          </Link>
        </div>
      </div>
    </div>
  );
};

