import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';
import { useHelpStore } from '../../store/useHelpStore';
import { useRecycleStore } from '../../store/useRecycleStore';
import { useChatStore } from '../../store/useChatStore';
import { 
  Settings, 
  ChevronRight, 
  ShoppingCart, 
  HeartHandshake, 
  Users, 
  MapPin, 
  Check, 
  MessageSquare, 
  Shield, 
  Phone, 
  Send, 
  UserCheck 
} from 'lucide-react-native';
import LocationModal from '../../components/LocationModal';
import EditContactModal from '../../components/EditContactModal';
import ChatHistoryModal from '../../components/ChatHistoryModal';
import AdminDashboardModal from '../../components/AdminDashboardModal';

const recycleIcon = require('../../images/recycle_icon.png');

export default function ProfileScreen() {
  const { currentUser, allUsers, switchUserById } = useUserStore();
  const { listings } = useMarketStore();
  const { requests } = useHelpStore();
  const { donations } = useRecycleStore();
  const { conversations } = useChatStore();

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [personaModalVisible, setPersonaModalVisible] = useState(false);
  const [editContactVisible, setEditContactVisible] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);
  const [adminDashboardVisible, setAdminDashboardVisible] = useState(false);

  if (!currentUser) return null;

  const myListingsCount = listings.filter((l) => l.sellerId === currentUser.id).length;
  const myHelpCount = requests.filter((r) => r.requesterId === currentUser.id || r.fulfilledBy === currentUser.name).length;
  const myDonationCount = donations.filter((d) => d.donorId === currentUser.id).length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row justify-between items-center border-b border-gray-100">
        <Text className="text-2xl font-black text-gray-900">Profil Saya</Text>
        <TouchableOpacity 
          onPress={() => setPersonaModalVisible(true)}
          className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-200"
        >
          <Users size={14} color="#16a34a" />
          <Text className="text-xs font-bold text-green-800 ml-1">Tukar Pengguna (Viva)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View className="bg-white p-6 items-center border-b border-gray-100 mb-3">
          <Image
            source={{ uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }}
            className="w-24 h-24 rounded-full bg-gray-200 mb-3 border-4 border-green-600"
          />
          <View className="flex-row items-center">
            <Text className="text-2xl font-black text-gray-900">{currentUser.name}</Text>
            {currentUser.role === 'Admin' ? (
              <View className="ml-2 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                <Text className="text-[10px] text-amber-900 font-bold">Admin/SV</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-gray-400 text-xs mt-0.5">{currentUser.email}</Text>

          {/* Location Badge */}
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            className="flex-row items-center mt-2 bg-gray-100 px-3.5 py-1.5 rounded-full border border-gray-200"
          >
            <MapPin size={14} color="#16a34a" />
            <Text className="text-gray-700 text-xs font-semibold ml-1">{currentUser.location}</Text>
            <ChevronRight size={12} color="#9ca3af" className="ml-1" />
          </TouchableOpacity>

          {/* Contact Details Quick Preview Card */}
          <TouchableOpacity
            onPress={() => setEditContactVisible(true)}
            className="mt-3 bg-green-50/80 px-4 py-2 rounded-2xl border border-green-200 flex-row items-center"
          >
            <Phone size={14} color="#16a34a" />
            <Text className="text-xs font-bold text-green-800 ml-1.5">
              {currentUser.phone ? `WhatsApp: ${currentUser.phone}` : 'Tetapkan No. WhatsApp / Telefon'}
            </Text>
            <ChevronRight size={12} color="#16a34a" className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* Real-time Activity Stats Grid */}
        <View className="bg-white p-4 flex-row justify-between border-b border-gray-100 mb-3 mx-4 rounded-2xl shadow-sm">
          <View className="items-center flex-1 border-r border-gray-100">
            <Text className="text-2xl font-black text-blue-600">{myListingsCount}</Text>
            <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">Iklan Jualan</Text>
          </View>
          <View className="items-center flex-1 border-r border-gray-100">
            <Text className="text-2xl font-black text-green-600">{myDonationCount + 1}</Text>
            <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">Barang Derma</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-black text-purple-600">{myHelpCount}</Text>
            <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">Bantuan Jiran</Text>
          </View>
        </View>

        {/* Menu Navigation Items */}
        <View className="bg-white mx-4 rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          {/* Sejarah Mesej / Chat History (Requirement 6) */}
          <TouchableOpacity 
            onPress={() => setChatHistoryVisible(true)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center border border-green-100">
              <MessageSquare size={20} color="#16a34a" />
            </View>
            <View className="flex-1 ml-3.5">
              <View className="flex-row items-center justify-between mr-1">
                <Text className="text-gray-900 text-sm font-bold">Sejarah Mesej (Chat History)</Text>
                {conversations.length > 0 && (
                  <View className="bg-green-600 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold">{conversations.length}</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-400 text-xs mt-0.5">Lihat perbualan aktif dengan jiran</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* Maklumat Perhubungan / Contact Details (Requirement 5) */}
          <TouchableOpacity 
            onPress={() => setEditContactVisible(true)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center border border-blue-100">
              <Phone size={20} color="#2563eb" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-gray-900 text-sm font-bold">Maklumat Perhubungan Pengguna</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Ubah No. Telefon, WhatsApp, Telegram & Nota</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* Tetapan Komuniti & Radius */}
          <TouchableOpacity 
            onPress={() => setLocationModalVisible(true)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center border border-purple-100">
              <MapPin size={20} color="#9333ea" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-gray-900 text-sm font-bold">Kawasan Kejiranan & Radius</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Tukar zon komuniti atau jarak carian</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* Supervisor & Admin Dashboard (Requirement 9) */}
          <TouchableOpacity 
            onPress={() => setAdminDashboardVisible(true)}
            className="flex-row items-center p-4 bg-amber-50/50 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-amber-100 rounded-xl items-center justify-center border border-amber-300">
              <Shield size={20} color="#b45309" />
            </View>
            <View className="flex-1 ml-3.5">
              <View className="flex-row items-center">
                <Text className="text-gray-900 text-sm font-bold">Dashboard Admin & Data Pengguna</Text>
                <View className="bg-amber-500 px-1.5 py-0.5 rounded ml-1.5">
                  <Text className="text-slate-950 font-black text-[9px]">SV</Text>
                </View>
              </View>
              <Text className="text-gray-500 text-xs mt-0.5">Semakan SV, data pengguna & statistik FYP</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* Switch User Persona for Viva */}
          <TouchableOpacity 
            onPress={() => setPersonaModalVisible(true)}
            className="flex-row items-center p-4"
          >
            <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center border border-gray-200">
              <Users size={20} color="#4b5563" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-gray-900 text-sm font-bold">Tukar Pengguna Demo (Simulasi Viva)</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Tukar peranan Aisyah, Abu Bakar, Siti, atau Admin</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Demo Persona Switcher Modal */}
      <Modal visible={personaModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
            <Text className="text-xl font-bold text-gray-900 mb-1">Tukar Pengguna Demo (FYP Viva)</Text>
            <Text className="text-gray-500 text-xs mb-4">
              Pilih akaun berbeza untuk menguji interaksi dan simulasi chat sesama jiran.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {allUsers.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => {
                    switchUserById(u.id);
                    setPersonaModalVisible(false);
                  }}
                  className={`flex-row items-center p-3.5 rounded-2xl mb-2.5 border ${
                    currentUser.id === u.id
                      ? 'bg-green-50 border-green-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Image source={{ uri: u.avatarUrl }} className="w-12 h-12 rounded-full mr-3" />
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-sm font-bold text-gray-900 mr-2">{u.name}</Text>
                      {u.role === 'Admin' && (
                        <View className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          <Text className="text-[10px] text-amber-800 font-bold">Admin/SV</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-500 text-xs">{u.location}</Text>
                    <Text className="text-gray-400 text-[11px]">{u.phone || 'Tiada telefon'}</Text>
                  </View>
                  {currentUser.id === u.id && <Check size={20} color="#16a34a" />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setPersonaModalVisible(false)}
              className="mt-3 py-3 rounded-2xl items-center bg-gray-100"
            >
              <Text className="text-gray-700 font-bold text-sm">Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />

      {/* Edit Contact Details Modal */}
      <EditContactModal
        visible={editContactVisible}
        onClose={() => setEditContactVisible(false)}
      />

      {/* Chat History Modal */}
      <ChatHistoryModal
        visible={chatHistoryVisible}
        onClose={() => setChatHistoryVisible(false)}
      />

      {/* Admin Dashboard Modal (For SV Review) */}
      <AdminDashboardModal
        visible={adminDashboardVisible}
        onClose={() => setAdminDashboardVisible(false)}
      />
    </SafeAreaView>
  );
}
