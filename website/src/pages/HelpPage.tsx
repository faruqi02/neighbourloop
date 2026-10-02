import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { HelpRequest } from '../types';
import { Trash2, Search, CheckCircle2, HeartHandshake, User, Tag } from 'lucide-react';

export const HelpPage = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HelpRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [newHelp, setNewHelp] = useState({
    title: '',
    description: '',
    category: 'Pinjam Barang',
    type: 'Permintaan',
    requesterName: 'Admin',
    requesterPhone: '',
    requesterContactNotes: '',
    imageUrl: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchHelpRequests();
  }, []);

  const fetchHelpRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getHelpRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat turun data bantuan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelp.title) {
      showToast('Sila masukkan tajuk bantuan', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createHelpRequest(newHelp);
      showToast('Bantuan berjaya ditambah!', 'success');
      setShowAddModal(false);
      setNewHelp({
        title: '',
        description: '',
        category: 'Pinjam Barang',
        type: 'Permintaan',
        requesterName: 'Admin',
        requesterPhone: '',
        requesterContactNotes: '',
        imageUrl: ''
      });
      fetchHelpRequests();
    } catch (err) {
      showToast('Gagal menambah bantuan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfill = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.fulfillHelpRequest(id);
      showToast('Bantuan ditandakan sebagai selesai!', 'success');
      fetchHelpRequests();
    } catch (err) {
      showToast('Gagal mengemas kini status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHelp = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteHelpRequest(itemToDelete.id);
      showToast('Bantuan berjaya dipadam!', 'success');
      setItemToDelete(null);
      fetchHelpRequests();
    } catch (err) {
      showToast('Gagal memadam bantuan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((item) => {
    const matchType =
      typeFilter === 'Semua' ||
      item.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchCat = categoryFilter === 'Semua' || item.category === categoryFilter;
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.requesterName?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCat && matchSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Help Nearby</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau permohonan dan tawaran bantuan sesama komuniti kejiranan
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          + Tambah Bantuan
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tajuk, keterangan, atau nama jiran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Type Filter */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['Semua', 'Permintaan', 'Tawaran'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  typeFilter === t
                    ? 'bg-white text-purple-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Pinjam Barang">Pinjam Barang</option>
            <option value="Khidmat/Tenaga">Khidmat/Tenaga</option>
            <option value="Kemahiran">Kemahiran</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Siaran Bantuan</th>
                <th className="px-6 py-4 font-semibold">Jenis</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Pemohon / Pemberi</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tarikh</th>
                <th className="px-6 py-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Memuatkan senarai bantuan...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <HeartHandshake className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    Tiada siaran bantuan dijumpai.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Item */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                            <HeartHandshake className="w-6 h-6" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.type?.toLowerCase() === 'tawaran'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.category}
                      </span>
                    </td>

                    {/* Requester */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        @{item.requesterName?.replace(/^@/, '') || 'Jiran'}
                      </p>
                      {item.requesterPhone && (
                        <p className="text-xs text-gray-400">{item.requesterPhone}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {item.status === 'Completed' ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          Selesai {item.fulfilledBy ? `(${item.fulfilledBy})` : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Dibuka
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.createdAt || 'Baru sahaja'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.status !== 'Completed' && (
                          <button
                            onClick={() => handleFulfill(item.id)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Tandakan Selesai"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Padam Bantuan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Help Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-gray-900 mb-4">+ Siarkan Bantuan Baharu</h2>
            <form onSubmit={handleCreateHelp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Jenis Bantuan
                </label>
                <div className="flex gap-2">
                  {['Permintaan', 'Tawaran'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewHelp({ ...newHelp, type: t })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        newHelp.type === t
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {t === 'Permintaan' ? '🙋‍♂️ Permintaan (Minta Tolong)' : '🤝 Tawaran (Sedia Membantu)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Tajuk Bantuan *
                </label>
                <input
                  type="text"
                  required
                  value={newHelp.title}
                  onChange={(e) => setNewHelp({ ...newHelp, title: e.target.value })}
                  placeholder="Contoh: Pinjam tangga lipat 1 jam"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={newHelp.category}
                  onChange={(e) => setNewHelp({ ...newHelp, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                >
                  <option value="Pinjam Barang">Pinjam Barang</option>
                  <option value="Khidmat/Tenaga">Khidmat/Tenaga</option>
                  <option value="Kemahiran">Kemahiran</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Penerangan Lanjut
                </label>
                <textarea
                  rows={3}
                  value={newHelp.description}
                  onChange={(e) => setNewHelp({ ...newHelp, description: e.target.value })}
                  placeholder="Nyatakan keperluan atau syarat..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Nama Pemohon
                  </label>
                  <input
                    type="text"
                    value={newHelp.requesterName}
                    onChange={(e) => setNewHelp({ ...newHelp, requesterName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newHelp.requesterPhone}
                    onChange={(e) => setNewHelp({ ...newHelp, requesterPhone: e.target.value })}
                    placeholder="012-3456789"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  URL Gambar (Pilihan)
                </label>
                <input
                  type="text"
                  value={newHelp.imageUrl}
                  onChange={(e) => setNewHelp({ ...newHelp, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Siarkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Padam Siaran Bantuan?</h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              Adakah anda pasti ingin memadamkan siaran bantuan <strong>"{itemToDelete.title}"</strong>?
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
                onClick={handleDeleteHelp}
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
