import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { Pencil, Trash2 } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'User', neighborhood: '', password: '' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.getUsers().then(setUsers);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await api.createUser(newUser);
      setUsers([...users, created]);
      setShowModal(false);
      setNewUser({ name: '', email: '', phone: '', role: 'User', neighborhood: '', password: '' });
      showToast("Berjaya tambah pengguna!", "success");
    } catch (e) {
      showToast("Gagal tambah pengguna", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await api.updateUser(editingUser.id, editingUser);
      showToast('Berjaya dikemas kini!', 'success');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      showToast('Gagal mengemas kini pengguna', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteUser(userToDelete.id);
      showToast('Pengguna berjaya dipadam!', 'success');
      fetchUsers();
      setUserToDelete(null);
    } catch (error) {
      showToast('Gagal memadam pengguna', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pengurusan Pengguna</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          + Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Peranan</th>
              <th className="px-6 py-4 font-medium">No. Telefon</th>
              <th className="px-6 py-4 font-medium">Kejiranan</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {u.name ? u.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.location || u.neighborhood}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => setEditingUser({...u, newPassword: ''})} className="text-emerald-600 hover:text-emerald-800 p-2 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => setUserToDelete(u)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Padam">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Pengguna Baru</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mel</label>
                <input required type="email" className="w-full border border-gray-300 rounded-lg p-2" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kejiranan</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={newUser.neighborhood} onChange={e => setNewUser({...newUser, neighborhood: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peranan</label>
                <select className="w-full border border-gray-300 rounded-lg p-2" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
                <input required type="password" placeholder="Masukkan kata laluan" className="w-full border border-gray-300 rounded-lg p-2" value={(newUser as any).password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Pengguna</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mel</label>
                <input required type="email" className="w-full border border-gray-300 rounded-lg p-2" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kejiranan</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={editingUser.location || editingUser.neighborhood || ''} onChange={e => setEditingUser({...editingUser, location: e.target.value, neighborhood: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peranan</label>
                <select className="w-full border border-gray-300 rounded-lg p-2" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="pt-2 border-t border-gray-100 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan Baru (Pilihan)</label>
                <input 
                  type="password" 
                  placeholder="Biar kosong jika tidak mahu tukar" 
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  value={editingUser.newPassword || ''} 
                  onChange={e => setEditingUser({...editingUser, newPassword: e.target.value})} 
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setEditingUser(null)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Adakah anda pasti?</h2>
            <p className="text-gray-500 mb-6">Tindakan ini akan memadam pengguna <span className="font-bold text-gray-900">{userToDelete.name}</span> secara kekal dan tidak boleh diundur.</p>
            
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => setUserToDelete(null)} disabled={isSubmitting} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">Batal</button>
              <button type="button" onClick={handleDeleteConfirm} disabled={isSubmitting} className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50">
                {isSubmitting ? 'Memadam...' : 'Ya, Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

