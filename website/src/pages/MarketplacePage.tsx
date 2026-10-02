import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Listing } from '../types';
import { Trash2, Search, ShoppingBag, Eye, Tag, Ban, ShieldAlert, ShieldCheck } from 'lucide-react';

export const MarketplacePage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Disekat'>('Semua');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [itemToBlock, setItemToBlock] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Listing Form
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Perabot',
    condition: 'Terpakai',
    imageUrl: '',
    sellerName: 'Admin',
    sellerPhone: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings();
      setListings(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat turun data marketplace', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title || !newListing.price) {
      showToast('Sila lengkapkan tajuk dan harga', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createListing({
        ...newListing,
        price: parseFloat(newListing.price) || 0,
        imageUrl: newListing.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
      });
      showToast('Iklan jualan berjaya ditambah!', 'success');
      setShowAddModal(false);
      setNewListing({
        title: '',
        description: '',
        price: '',
        category: 'Perabot',
        condition: 'Terpakai',
        imageUrl: '',
        sellerName: 'Admin',
        sellerPhone: ''
      });
      fetchListings();
    } catch (err) {
      showToast('Gagal menambah iklan jualan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteListing(listingToDelete.id);
      showToast('Iklan berjaya dipadam!', 'success');
      setListingToDelete(null);
      fetchListings();
    } catch (err) {
      showToast('Gagal memadam iklan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlock = async (item: Listing, explicitBlock?: boolean) => {
    setIsSubmitting(true);
    const targetBlocked = explicitBlock !== undefined ? explicitBlock : !(item.isBlocked || item.status === 'Disekat');
    try {
      await api.toggleBlockListing(item.id, targetBlocked);
      showToast(targetBlocked ? 'Iklan berjaya disekat daripada paparan umum!' : 'Sekatan iklan dibuka semula!', 'success');
      setItemToBlock(null);
      if (selectedListing && selectedListing.id === item.id) {
        setSelectedListing({
          ...selectedListing,
          status: targetBlocked ? 'Disekat' : 'Aktif',
          isBlocked: targetBlocked
        });
      }
      fetchListings();
    } catch (err) {
      showToast('Gagal mengubah status sekatan iklan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    const isItemBlocked = item.isBlocked || item.status === 'Disekat';
    const matchStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'Disekat' && isItemBlocked) ||
      (statusFilter === 'Aktif' && !isItemBlocked);

    const matchCat = categoryFilter === 'Semua' || item.category === categoryFilter;
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.sellerName?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchCat && matchSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau dan urus semua barangan jualan komuniti kejiranan
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          + Tambah Barang
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tajuk, keterangan, atau penjual..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          {/* Status Filter */}
          <div className="flex gap-1.5 items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase mr-1">Status:</span>
            {(['Semua', 'Aktif', 'Disekat'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? st === 'Disekat'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 items-center flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase mr-1">Kategori:</span>
            {['Semua', 'Perabot', 'Elektronik', 'Pakaian', 'Lain-lain'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Barangan</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Keadaan</th>
                <th className="px-6 py-4 font-semibold">Penjual</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tarikh Disiarkan</th>
                <th className="px-6 py-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Memuatkan senarai marketplace...
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    Tiada barangan dijumpai.
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${item.isBlocked || item.status === 'Disekat' ? 'bg-rose-50/20' : ''}`}>
                    {/* Item Thumbnail & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200"
                        />
                        <div className="max-w-xs">
                          <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      RM {Number(item.price || 0).toFixed(0)}
                    </td>

                    {/* Condition */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          item.condition === 'Baru'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.condition || 'Terpakai'}
                      </span>
                    </td>

                    {/* Seller */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">@{item.sellerName?.replace(/^@/, '') || 'Jiran'}</p>
                      {item.sellerPhone && (
                        <p className="text-xs text-gray-400">{item.sellerPhone}</p>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      {item.isBlocked || item.status === 'Disekat' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Disekat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Aktif
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.createdAt || 'Baru sahaja'}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedListing(item)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Lihat Butiran"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToBlock(item)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isBlocked || item.status === 'Disekat'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title={item.isBlocked || item.status === 'Disekat' ? 'Buka Sekatan Iklan' : 'Sekat Iklan Ini (Admin Moderation)'}
                        >
                          {item.isBlocked || item.status === 'Disekat' ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setListingToDelete(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Padam Iklan"
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

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-gray-900 mb-4">+ Tambah Iklan Marketplace</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Tajuk Barang *
                </label>
                <input
                  type="text"
                  required
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  placeholder="Contoh: Meja Belajar Ikea"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Harga (RM) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    placeholder="Contoh: 50"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Keadaan
                  </label>
                  <select
                    value={newListing.condition}
                    onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="Baru">Baru</option>
                    <option value="Seperti Baru">Seperti Baru</option>
                    <option value="Terpakai">Terpakai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={newListing.category}
                  onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="Perabot">Perabot</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Penerangan
                </label>
                <textarea
                  rows={2}
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  placeholder="Keterangan keadaan barang..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  URL Gambar (Pilihan)
                </label>
                <input
                  type="text"
                  value={newListing.imageUrl}
                  onChange={(e) => setNewListing({ ...newListing, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Nama Penjual
                  </label>
                  <input
                    type="text"
                    value={newListing.sellerName}
                    onChange={(e) => setNewListing({ ...newListing, sellerName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newListing.sellerPhone}
                    onChange={(e) => setNewListing({ ...newListing, sellerPhone: e.target.value })}
                    placeholder="012-3456789"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="relative mb-4">
              <img
                src={selectedListing.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
                alt={selectedListing.title}
                className="w-full h-48 rounded-xl object-cover bg-gray-100"
              />
              <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                {selectedListing.condition || 'Terpakai'}
              </span>
            </div>

            <div className="flex justify-between items-baseline mb-2">
              <h2 className="text-xl font-bold text-gray-900">{selectedListing.title}</h2>
              <span className="text-xl font-black text-emerald-600">
                RM {Number(selectedListing.price || 0).toFixed(0)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {selectedListing.description || 'Tiada keterangan lanjut.'}
            </p>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-600 mb-5">
              <p>
                <span className="font-semibold text-gray-400">Status:</span>{' '}
                <span className={`font-bold ${selectedListing.isBlocked || selectedListing.status === 'Disekat' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedListing.isBlocked || selectedListing.status === 'Disekat' ? 'Disekat oleh Admin' : 'Aktif (Dapat Dilihat)'}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-400">Kategori:</span> {selectedListing.category}
              </p>
              <p>
                <span className="font-semibold text-gray-400">Penjual:</span> @{selectedListing.sellerName}
              </p>
              {selectedListing.sellerPhone && (
                <p>
                  <span className="font-semibold text-gray-400">No. Telefon:</span> {selectedListing.sellerPhone}
                </p>
              )}
              {selectedListing.sellerContactNotes && (
                <p>
                  <span className="font-semibold text-gray-400">Nota:</span> {selectedListing.sellerContactNotes}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleBlock(selectedListing)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  selectedListing.isBlocked || selectedListing.status === 'Disekat'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                {selectedListing.isBlocked || selectedListing.status === 'Disekat' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Buka Sekatan Iklan
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 text-rose-600" />
                    Sekat Iklan (Admin)
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedListing(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {itemToBlock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              itemToBlock.isBlocked || itemToBlock.status === 'Disekat' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {itemToBlock.isBlocked || itemToBlock.status === 'Disekat' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Ban className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              {itemToBlock.isBlocked || itemToBlock.status === 'Disekat' ? 'Buka Sekatan Iklan?' : 'Sekat Iklan Ini?'}
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              {itemToBlock.isBlocked || itemToBlock.status === 'Disekat' ? (
                <>Adakah anda ingin membuka semula sekatan pada iklan <strong>"{itemToBlock.title}"</strong>? Iklan akan kembali boleh dilihat oleh semua pengguna di aplikasi.</>
              ) : (
                <>Iklan <strong>"{itemToBlock.title}"</strong> akan disembunyikan daripada carian dan paparan komuniti serta-merta.</>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setItemToBlock(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleToggleBlock(itemToBlock)}
                className={`flex-1 px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                  itemToBlock.isBlocked || itemToBlock.status === 'Disekat'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Memproses...' : (itemToBlock.isBlocked || itemToBlock.status === 'Disekat' ? 'Buka Sekatan' : 'Sekat Iklan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {listingToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Padam Barangan?</h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              Adakah anda pasti ingin memadam iklan <strong>"{listingToDelete.title}"</strong>? Tindakan ini tidak boleh diundur.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setListingToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteListing}
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
