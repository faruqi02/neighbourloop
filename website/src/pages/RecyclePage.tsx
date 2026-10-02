import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DonationItem, RecycleCenter } from '../types';
import { Trash2, Search, HeartHandshake, Building2, MapPin, Phone, Tag } from 'lucide-react';

export const RecyclePage = () => {
  const [activeTab, setActiveTab] = useState<'donations' | 'centers'>('donations');
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [centers, setCenters] = useState<RecycleCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Delete Donation
  const [itemToDelete, setItemToDelete] = useState<DonationItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsData, centersData] = await Promise.all([
        api.getDonations(),
        api.getRecycleCenters()
      ]);
      setDonations(donationsData);
      setCenters(centersData);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat turun data sumbangan & kitar semula', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteDonation(itemToDelete.id);
      showToast('Barang derma berjaya dipadam!', 'success');
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      showToast('Gagal memadam barang derma', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDonations = donations.filter((item) => {
    const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.donorName?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredCenters = centers.filter((c) => {
    return (
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase()) ||
      c.type?.toLowerCase().includes(search.toLowerCase()) ||
      c.typesAccepted?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Derma & Kitar Semula</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau barang sumbangan percuma komuniti dan direktori pusat kitar semula / NGO
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'donations'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Barangan Derma ({donations.length})
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'centers'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Pusat Kitar Semula & NGO ({centers.length})
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'donations'
                ? 'Cari tajuk sumbangan, penderma, atau kategori...'
                : 'Cari nama pusat, alamat, atau bahan diterima...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {activeTab === 'donations' && (
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase mr-1">Status:</span>
            {['Semua', 'Available', 'Claimed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'Available' ? 'Belum Diambil' : st === 'Claimed' ? 'Telah Diambil' : 'Semua'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'donations' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Barangan Derma</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Penderma</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tarikh Disiarkan</th>
                  <th className="px-6 py-4 font-semibold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Memuatkan senarai derma...
                    </td>
                  </tr>
                ) : filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <HeartHandshake className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      Tiada barangan sumbangan dijumpai.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Image & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.imageUrl ||
                              'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400'
                            }
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200"
                          />
                          <div className="max-w-xs">
                            <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {item.description || 'Tiada keterangan lanjut.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          <Tag className="w-3 h-3 text-purple-400" />
                          {item.category}
                        </span>
                      </td>

                      {/* Donor */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">@{item.donorName?.replace(/^@/, '') || 'Penderma'}</p>
                        {item.donorPhone && (
                          <p className="text-xs text-gray-400">{item.donorPhone}</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {item.status === 'Claimed' ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            Telah Dituntut {item.claimedBy ? `(${item.claimedBy})` : ''}
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Tersedia (Percuma)
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {item.createdAt || 'Baru sahaja'}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Padam Barang Derma"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pusat / NGO</th>
                  <th className="px-6 py-4 font-semibold">Jenis</th>
                  <th className="px-6 py-4 font-semibold">Alamat & Lokasi</th>
                  <th className="px-6 py-4 font-semibold">Bahan Diterima</th>
                  <th className="px-6 py-4 font-semibold">Waktu Operasi & Hubungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Memuatkan direktori pusat...
                    </td>
                  </tr>
                ) : filteredCenters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Building2 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      Tiada pusat kitar semula dijumpai.
                    </td>
                  </tr>
                ) : (
                  filteredCenters.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{c.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            c.type === 'NGO'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {c.type === 'NGO' ? 'NGO Kebajikan' : 'Pusat Kitar Semula'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span>{c.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {c.typesAccepted?.map((mat, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <p className="font-medium text-gray-800">{c.operatingHours || 'Setiap Hari'}</p>
                        {c.contactPhone && (
                          <p className="text-gray-400 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {c.contactPhone}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Padam Barang Derma?</h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              Adakah anda pasti ingin memadamkan rekod sumbangan <strong>"{itemToDelete.title}"</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteDonation}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Memadam...' : 'Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
