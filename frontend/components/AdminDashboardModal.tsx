import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Image, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Users, 
  Shield, 
  BarChart3, 
  FileText, 
  Trash2, 
  PlusCircle, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  Tag 
} from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { useMarketStore } from '../store/useMarketStore';
import { useRecycleStore } from '../store/useRecycleStore';
import { useHelpStore } from '../store/useHelpStore';
import { useNoticeStore } from '../store/useNoticeStore';

interface AdminDashboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdminDashboardModal({ visible, onClose }: AdminDashboardModalProps) {
  const { allUsers, deleteUser, updateUserStatus } = useUserStore();
  const { listings, deleteListing } = useMarketStore();
  const { donations, deleteDonation, centers } = useRecycleStore();
  const { requests, deleteRequest } = useHelpStore();
  const { notices, addNotice, deleteNotice } = useNoticeStore();

  const [activeTab, setActiveTab] = useState<'kpi' | 'users' | 'moderation' | 'newNotice'>('kpi');

  // Form New Notice
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCat, setNoticeCat] = useState<'Gotong-Royong' | 'Penyelenggaraan' | 'Keselamatan' | 'Hebahan'>('Gotong-Royong');
  const [noticeDesc, setNoticeDesc] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [noticeTime, setNoticeTime] = useState('');
  const [noticeLoc, setNoticeLoc] = useState('');
  const [noticeOrganizer, setNoticeOrganizer] = useState('');
  const [noticeContact, setNoticeContact] = useState('');

  const handleCreateNotice = () => {
    if (!noticeTitle.trim() || !noticeDesc.trim()) {
      Alert.alert('Ralat', 'Sila masukkan tajuk dan penerangan hebahan.');
      return;
    }

    addNotice({
      title: noticeTitle,
      category: noticeCat,
      description: noticeDesc,
      date: noticeDate || 'Hujung minggu ini',
      time: noticeTime || '8:00 AM',
      location: noticeLoc || 'Kawasan Komuniti',
      organizer: noticeOrganizer || 'Pentadbiran Komuniti NeighbourLoop',
      contactPerson: noticeContact || 'Pegawai Bertugas (019-1234567)',
      isImportant: true,
    });

    Alert.alert('Berjaya', 'Informasi Komuniti berjaya diterbitkan ke papan utama.');
    setNoticeTitle('');
    setNoticeDesc('');
    setNoticeDate('');
    setNoticeTime('');
    setNoticeLoc('');
    setNoticeOrganizer('');
    setNoticeContact('');
    setActiveTab('kpi');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView className="flex-1 bg-slate-900">
        {/* Admin Top Bar */}
        <View className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 items-center justify-center mr-3">
              <Shield size={22} color="#f59e0b" />
            </View>
            <View>
              <Text className="text-lg font-black text-white">Dashboard Admin & SV</Text>
              <Text className="text-xs text-slate-400">Pengurusan Sistem & Data Komuniti</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
            <X size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-slate-800 p-1 mx-4 my-3 rounded-2xl">
          <TouchableOpacity
            onPress={() => setActiveTab('kpi')}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'kpi' ? 'bg-amber-500' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'kpi' ? 'text-slate-950' : 'text-slate-300'}`}>
              Statistik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'users' ? 'bg-amber-500' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'users' ? 'text-slate-950' : 'text-slate-300'}`}>
              Pengguna ({allUsers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('moderation')}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'moderation' ? 'bg-amber-500' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'moderation' ? 'text-slate-950' : 'text-slate-300'}`}>
              Moderasi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('newNotice')}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'newNotice' ? 'bg-amber-500' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'newNotice' ? 'text-slate-950' : 'text-slate-300'}`}>
              + Hebahan
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: KPI & Metrics Overview */}
        {activeTab === 'kpi' && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-white font-bold text-sm mb-3">Ringkasan Metrik Platform (Real-time)</Text>
            
            <View className="flex-row flex-wrap justify-between mb-4">
              <View className="w-[48%] bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-3">
                <Users size={24} color="#38bdf8" />
                <Text className="text-3xl font-black text-white mt-2">{allUsers.length}</Text>
                <Text className="text-xs text-slate-400">Pengguna Berdaftar</Text>
              </View>

              <View className="w-[48%] bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-3">
                <Tag size={24} color="#34d399" />
                <Text className="text-3xl font-black text-white mt-2">{listings.length}</Text>
                <Text className="text-xs text-slate-400">Iklan Marketplace</Text>
              </View>

              <View className="w-[48%] bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-3">
                <FileText size={24} color="#a78bfa" />
                <Text className="text-3xl font-black text-white mt-2">{requests.length}</Text>
                <Text className="text-xs text-slate-400">Bantuan Kejiranan</Text>
              </View>

              <View className="w-[48%] bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-3">
                <BarChart3 size={24} color="#f472b6" />
                <Text className="text-3xl font-black text-white mt-2">{donations.length}</Text>
                <Text className="text-xs text-slate-400">Barang Derma (Claim)</Text>
              </View>
            </View>

            {/* System Status Info */}
            <View className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-6">
              <Text className="text-amber-400 font-bold text-xs uppercase mb-2">Maklumat Arkitektur & Backend</Text>
              <Text className="text-slate-300 text-xs leading-5">
                • <Text className="font-semibold text-white">Backend Framework:</Text> FastAPI (Python 3.12) & Uvicorn{'\n'}
                • <Text className="font-semibold text-white">Cloud Database:</Text> Google Apps Script Web App API & Google Sheets{'\n'}
                • <Text className="font-semibold text-white">Frontend Engine:</Text> Expo React Native (SDK 57){'\n'}
                • <Text className="font-semibold text-white">API Swagger Docs:</Text> http://127.0.0.1:8000/docs
              </Text>
            </View>

            <View className="h-10" />
          </ScrollView>
        )}

        {/* TAB 2: User Data Table & Management */}
        {activeTab === 'users' && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-white font-bold text-sm mb-3">Senarai & Data Penuh Pengguna Kejiranan</Text>

            {allUsers.map((u) => (
              <View key={u.id} className="bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Image source={{ uri: u.avatarUrl }} className="w-10 h-10 rounded-full mr-3 bg-slate-700" />
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-white font-bold text-sm mr-2">{u.name}</Text>
                        {u.role === 'Admin' ? (
                          <View className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                            <Text className="text-[10px] text-amber-400 font-bold">Admin</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text className="text-slate-400 text-xs">{u.email}</Text>
                    </View>
                  </View>

                  <View className={`px-2.5 py-1 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    <Text className={`text-[10px] font-bold ${u.status === 'Aktif' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {u.status || 'Aktif'}
                    </Text>
                  </View>
                </View>

                {/* User Details Details */}
                <View className="bg-slate-900/60 p-3 rounded-xl mb-3">
                  <View className="flex-row items-center mb-1">
                    <Phone size={12} color="#94a3b8" />
                    <Text className="text-slate-300 text-xs ml-1.5">{u.phone || 'Tiada no telefon'}</Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <MapPin size={12} color="#94a3b8" />
                    <Text className="text-slate-300 text-xs ml-1.5">{u.location} (Radius: {u.radiusKm} km)</Text>
                  </View>
                  {u.contactNotes ? (
                    <Text className="text-slate-400 text-[11px] mt-1 italic">Nota: "{u.contactNotes}"</Text>
                  ) : null}
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-end space-x-2">
                  <TouchableOpacity
                    onPress={() => {
                      const nextStatus = u.status === 'Aktif' ? 'Digantung' : 'Aktif';
                      updateUserStatus(u.id, nextStatus);
                      Alert.alert('Status Dikemaskini', `Status ${u.name} kini ditukar ke ${nextStatus}.`);
                    }}
                    className="bg-slate-700 px-3 py-1.5 rounded-lg mr-2"
                  >
                    <Text className="text-xs font-semibold text-slate-200">
                      {u.status === 'Aktif' ? 'Gantung Akaun' : 'Aktifkan Semula'}
                    </Text>
                  </TouchableOpacity>

                  {u.role !== 'Admin' && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Sahkan Padam', `Adakah anda pasti ingin memadam pengguna ${u.name}?`, [
                          { text: 'Batal', style: 'cancel' },
                          { text: 'Padam', style: 'destructive', onPress: () => deleteUser(u.id) },
                        ]);
                      }}
                      className="bg-rose-600/80 px-3 py-1.5 rounded-lg flex-row items-center"
                    >
                      <Trash2 size={12} color="white" />
                      <Text className="text-xs font-semibold text-white ml-1">Padam</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View className="h-10" />
          </ScrollView>
        )}

        {/* TAB 3: Content Moderation */}
        {activeTab === 'moderation' && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-white font-bold text-sm mb-3">Moderasi Iklan & Permintaan Komuniti</Text>

            <Text className="text-amber-400 text-xs font-bold uppercase mb-2">Iklan Marketplace Semasa ({listings.length})</Text>
            {listings.map((item) => (
              <View key={item.id} className="bg-slate-800 p-3 rounded-2xl mb-2 flex-row items-center justify-between border border-slate-700">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-slate-400 text-[11px]">Oleh: {item.sellerName} • RM {item.price}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    deleteListing(item.id);
                    Alert.alert('Berjaya Dipadam', 'Iklan telah dialih keluar dari Marketplace.');
                  }}
                  className="p-2 bg-rose-600/30 border border-rose-500 rounded-lg"
                >
                  <Trash2 size={14} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}

            <Text className="text-amber-400 text-xs font-bold uppercase mt-4 mb-2">Barang Derma Semasa ({donations.length})</Text>
            {donations.map((item) => (
              <View key={item.id} className="bg-slate-800 p-3 rounded-2xl mb-2 flex-row items-center justify-between border border-slate-700">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-slate-400 text-[11px]">Penderma: {item.donorName} • Status: {item.status}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    deleteDonation(item.id);
                    Alert.alert('Berjaya Dipadam', 'Barang derma telah dialih keluar.');
                  }}
                  className="p-2 bg-rose-600/30 border border-rose-500 rounded-lg"
                >
                  <Trash2 size={14} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}

            <Text className="text-amber-400 text-xs font-bold uppercase mt-4 mb-2">Permintaan Bantuan Semasa ({requests.length})</Text>
            {requests.map((item) => (
              <View key={item.id} className="bg-slate-800 p-3 rounded-2xl mb-2 flex-row items-center justify-between border border-slate-700">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-slate-400 text-[11px]">Oleh: {item.requesterName} • {item.category}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    deleteRequest(item.id);
                    Alert.alert('Berjaya Dipadam', 'Permintaan bantuan telah dialih keluar.');
                  }}
                  className="p-2 bg-rose-600/30 border border-rose-500 rounded-lg"
                >
                  <Trash2 size={14} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}

            <View className="h-10" />
          </ScrollView>
        )}

        {/* TAB 4: Publish New Notice */}
        {activeTab === 'newNotice' && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-white font-bold text-sm mb-3">Terbit Informasi Komuniti (Gotong-Royong / Baiki Jalan)</Text>

            <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Tajuk Hebahan</Text>
            <TextInput
              placeholder="Contoh: Gotong-Royong Bersih Parit Surau"
              placeholderTextColor="#64748b"
              value={noticeTitle}
              onChangeText={setNoticeTitle}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 mb-3 text-sm"
            />

            <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Kategori</Text>
            <View className="flex-row flex-wrap mb-3">
              {(['Gotong-Royong', 'Penyelenggaraan', 'Keselamatan', 'Hebahan'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNoticeCat(cat)}
                  className={`mr-2 mb-2 px-3 py-1.5 rounded-lg border ${
                    noticeCat === cat ? 'bg-amber-500 border-amber-500' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-bold ${noticeCat === cat ? 'text-slate-950' : 'text-slate-300'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Tarikh & Masa</Text>
            <View className="flex-row mb-3">
              <TextInput
                placeholder="Tarikh (Contoh: Sabtu ini)"
                placeholderTextColor="#64748b"
                value={noticeDate}
                onChangeText={setNoticeDate}
                className="flex-1 mr-2 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm"
              />
              <TextInput
                placeholder="Masa (Contoh: 8:00 AM)"
                placeholderTextColor="#64748b"
                value={noticeTime}
                onChangeText={setNoticeTime}
                className="flex-1 ml-2 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm"
              />
            </View>

            <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Lokasi</Text>
            <TextInput
              placeholder="Contoh: Dewan Komuniti Blok B"
              placeholderTextColor="#64748b"
              value={noticeLoc}
              onChangeText={setNoticeLoc}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 mb-3 text-sm"
            />

            <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Penerangan Lengkap</Text>
            <TextInput
              placeholder="Huraian mengenai aktiviti gotong-royong atau kerja penyelenggaraan..."
              placeholderTextColor="#64748b"
              value={noticeDesc}
              onChangeText={setNoticeDesc}
              multiline
              numberOfLines={4}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 mb-4 text-sm"
            />

            <TouchableOpacity
              onPress={handleCreateNotice}
              className="w-full bg-amber-500 py-4 rounded-2xl items-center shadow-lg shadow-amber-500/20 mb-8"
            >
              <Text className="text-slate-950 font-black text-base">Terbitkan Informasi Komuniti</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
