import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CommunityNotice } from '../types';
import { 
  Bell, 
  Search, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Eye, 
  X,
  FileText
} from 'lucide-react';

export const NoticesPage = () => {
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [priorityFilter, setPriorityFilter] = useState('Semua');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<CommunityNotice | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<CommunityNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'Gotong-Royong',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 AM',
    location: '',
    organizer: 'Pengurusan Komuniti',
    contactPerson: '',
    isImportant: false,
    imageUrl: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.getNotices();
      setNotices(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat turun data notis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.location.trim()) {
      showToast('Sila lengkapkan tajuk dan lokasi notis', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createNotice(newNotice);
      showToast('Notis berjaya disiarkan!', 'success');
      setShowAddModal(false);
      setNewNotice({
        title: '',
        category: 'Gotong-Royong',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '08:30 AM',
        location: '',
        organizer: 'Pengurusan Komuniti',
        contactPerson: '',
        isImportant: false,
        imageUrl: ''
      });
      fetchNotices();
    } catch (err) {
      showToast('Gagal mencipta notis', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!noticeToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteNotice(noticeToDelete.id);
      showToast('Notis berjaya dipadam!', 'success');
      setNoticeToDelete(null);
      fetchNotices();
    } catch (err) {
      showToast('Gagal memadam notis', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      n.organizer.toLowerCase().includes(search.toLowerCase()) ||
      n.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'Semua' || 
      n.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesPriority = 
      priorityFilter === 'Semua' ||
      (priorityFilter === 'Penting' && n.isImportant) ||
      (priorityFilter === 'Biasa' && !n.isImportant);

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getCategoryBadge = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('gotong')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (c.includes('penyelenggaraan') || c.includes('maintenance')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (c.includes('keselamatan') || c.includes('security')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (c.includes('aktiviti')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const totalImportant = notices.filter(n => n.isImportant).length;
  const totalGotongRoyong = notices.filter(n => n.category.toLowerCase().includes('gotong')).length;
  const totalMaintenance = notices.filter(n => n.category.toLowerCase().includes('penyelenggaraan')).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-500 text-white border-emerald-600' 
            : 'bg-rose-500 text-white border-rose-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-amber-500" />
            Notis & Pengumuman Komuniti
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan siarkan pengumuman komuniti, gotong-royong, serta kerja-kerja penyelenggaraan kejiranan.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl transition shadow-sm hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Cipta Notis Baharu
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah Notis</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{notices.length}</div>
          <div className="text-xs text-slate-500 mt-1">Hebahan aktif dalam sistem</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perhatian Penting</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{totalImportant}</div>
          <div className="text-xs text-slate-500 mt-1">Memerlukan perhatian segera</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gotong-Royong</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{totalGotongRoyong}</div>
          <div className="text-xs text-slate-500 mt-1">Aktiviti sukarelawan kejiranan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Penyelenggaraan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Info className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{totalMaintenance}</div>
          <div className="text-xs text-slate-500 mt-1">Notis fasiliti & utiliti</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari notis, penganjur, lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Gotong-Royong">Gotong-Royong</option>
            <option value="Penyelenggaraan">Penyelenggaraan</option>
            <option value="Keselamatan">Keselamatan</option>
            <option value="Aktiviti Komuniti">Aktiviti Komuniti</option>
            <option value="Hebahan">Hebahan</option>
            <option value="Umum">Umum</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="Semua">Semua Keutamaan</option>
            <option value="Penting">Penting Sahaja</option>
            <option value="Biasa">Biasa</option>
          </select>
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                <th className="py-3.5 px-4">Tajuk Notis & Keterangan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Tarikh & Masa</th>
                <th className="py-3.5 px-4">Lokasi</th>
                <th className="py-3.5 px-4">Penganjur & Hubungan</th>
                <th className="py-3.5 px-4">Status / Keutamaan</th>
                <th className="py-3.5 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-amber-500 border-t-transparent mb-2"></div>
                    <div>Memuat turun senarai notis komuniti...</div>
                  </td>
                </tr>
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <div>Tiada notis ditemui sepadan dengan carian anda.</div>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        {n.imageUrl ? (
                          <img
                            src={n.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 line-clamp-1">{n.title}</div>
                          <div className="text-xs text-slate-400 line-clamp-2 mt-0.5">{n.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadge(n.category)}`}>
                        {n.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {n.date}
                      </div>
                      {n.time && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {n.time}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{n.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {n.organizer}
                      </div>
                      {n.contactPerson && (
                        <div className="text-xs text-slate-400 mt-0.5 pl-5">
                          {n.contactPerson}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {n.isImportant ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          Penting
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Biasa
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedNotice(n)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Lihat Butiran Notis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNoticeToDelete(n)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Padam Notis"
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

      {/* Modal Cipta Notis Baharu */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Cipta Notis Komuniti Baharu
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tajuk Notis *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gotong-Royong Perdana Zon Hijau"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kategori *</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  >
                    <option value="Gotong-Royong">Gotong-Royong</option>
                    <option value="Penyelenggaraan">Penyelenggaraan</option>
                    <option value="Keselamatan">Keselamatan</option>
                    <option value="Aktiviti Komuniti">Aktiviti Komuniti</option>
                    <option value="Hebahan">Hebahan</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Penganjur *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Persatuan Penduduk"
                    value={newNotice.organizer}
                    onChange={(e) => setNewNotice({ ...newNotice, organizer: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tarikh Program/Notis *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026-10-15 atau Hari Ini"
                    value={newNotice.date}
                    onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Masa</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:30 AM - 12:00 PM"
                    value={newNotice.time}
                    onChange={(e) => setNewNotice({ ...newNotice, time: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lokasi / Tempat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dewan Komuniti Blok B"
                  value={newNotice.location}
                  onChange={(e) => setNewNotice({ ...newNotice, location: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Individu / No. Hubungan (Pilihan)</label>
                <input
                  type="text"
                  placeholder="Contoh: En. Razak (012-3456789)"
                  value={newNotice.contactPerson}
                  onChange={(e) => setNewNotice({ ...newNotice, contactPerson: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Pautan Imej / Poster (Pilihan)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newNotice.imageUrl}
                  onChange={(e) => setNewNotice({ ...newNotice, imageUrl: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kandungan / Butiran Lengkap *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Terangkan secara jelas tujuan notis, arahan kepada penduduk, atau barang yang perlu dibawa..."
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={newNotice.isImportant}
                  onChange={(e) => setNewNotice({ ...newNotice, isImportant: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="isImportant" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Tandakan sebagai Notis Penting (Keutamaan Tinggi & Muncul Di Atas)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Siarkan Notis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Butiran Notis */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getCategoryBadge(selectedNotice.category)}`}>
                  {selectedNotice.category}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{selectedNotice.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedNotice.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-50 flex items-center justify-center">
                <img 
                  src={selectedNotice.imageUrl} 
                  alt="" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-700">Tarikh:</span> {selectedNotice.date} {selectedNotice.time && `(${selectedNotice.time})`}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-slate-700">Lokasi:</span> {selectedNotice.location}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-slate-700">Penganjur:</span> {selectedNotice.organizer}
              </div>
              {selectedNotice.contactPerson && (
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-slate-700">Hubungan:</span> {selectedNotice.contactPerson}
                </div>
              )}
            </div>

            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penerangan Notis</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {selectedNotice.description}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Padam Notis */}
      {noticeToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">
              Padam Notis Komuniti?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
              Adakah anda pasti mahu memadam <strong className="text-slate-700">"{noticeToDelete.title}"</strong>? Notis ini tidak akan dapat dipaparkan lagi di aplikasi penduduk.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setNoticeToDelete(null)}
                className="w-1/2 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteNotice}
                className="w-1/2 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Memadam...' : 'Ya, Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
