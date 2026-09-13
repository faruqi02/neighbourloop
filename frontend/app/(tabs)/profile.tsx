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
import { 
  Leaf, 
  Settings, 
  ChevronRight, 
  ShoppingCart, 
  Recycle, 
  HeartHandshake, 
  Award, 
  Users, 
  MapPin, 
  Check, 
  Gift 
} from 'lucide-react-native';
import LocationModal from '../../components/LocationModal';

export default function ProfileScreen() {
  const { currentUser, allUsers, switchUserById } = useUserStore();
  const { listings } = useMarketStore();
  const { requests } = useHelpStore();
  const { donations } = useRecycleStore();

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [personaModalVisible, setPersonaModalVisible] = useState(false);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);

  const myListingsCount = listings.filter((l) => l.sellerId === currentUser.id).length;
  const myHelpCount = requests.filter((r) => r.requesterId === currentUser.id || r.fulfilledBy === currentUser.name).length;

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
          <Text className="text-xs font-bold text-green-800 ml-1">Tukar Persona Demo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white p-6 items-center border-b border-gray-100 mb-3">
          <Image
            source={{ uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }}
            className="w-24 h-24 rounded-full bg-gray-200 mb-3 border-4 border-green-500"
          />
          <Text className="text-2xl font-black text-gray-900">{currentUser.name}</Text>
          <Text className="text-gray-400 text-xs mt-0.5">{currentUser.email}</Text>

          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            className="flex-row items-center mt-2.5 bg-gray-100 px-3.5 py-1.5 rounded-full"
          >
            <MapPin size={14} color="#16a34a" />
            <Text className="text-gray-700 text-xs font-semibold ml-1">{currentUser.location}</Text>
            <ChevronRight size={12} color="#9ca3af" className="ml-1" />
          </TouchableOpacity>

          {/* Green Points Badge */}
          <TouchableOpacity 
            onPress={() => setRewardModalVisible(true)}
            className="bg-green-100 mt-4 px-5 py-2.5 rounded-full flex-row items-center border border-green-200 shadow-sm"
          >
            <Leaf size={18} color="#16a34a" />
            <Text className="text-green-800 font-black ml-2 text-sm">
              {currentUser.greenPoints} Mata Hijau (Tebus Baucar)
            </Text>
            <ChevronRight size={14} color="#16a34a" className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* Real-time Stats Grid */}
        <View className="bg-white p-4 flex-row justify-between border-b border-gray-100 mb-3 mx-4 rounded-2xl shadow-sm">
          <View className="items-center flex-1 border-r border-gray-100">
            <Text className="text-2xl font-black text-blue-600">{myListingsCount}</Text>
            <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">Iklan Jualan</Text>
          </View>
          <View className="items-center flex-1 border-r border-gray-100">
            <Text className="text-2xl font-black text-green-600">{donations.length + 2}</Text>
            <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">Kitar & Derma</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-black text-purple-600">{myHelpCount}</Text>
            <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">Bantuan Jiran</Text>
          </View>
        </View>

        {/* Menu Navigation Items */}
        <View className="bg-white mx-4 rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          <TouchableOpacity 
            onPress={() => setRewardModalVisible(true)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-yellow-50 rounded-xl items-center justify-center">
              <Gift size={20} color="#ca8a04" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-gray-900 text-sm font-bold">Katalog Ganjaran Lestari</Text>
              <Text className="text-gray-400 text-xs">Tebus baucar pasar raya & kedai eco</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setLocationModalVisible(true)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center">
              <MapPin size={20} color="#16a34a" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-gray-900 text-sm font-bold">Tetapan Komuniti & Radius</Text>
              <Text className="text-gray-400 text-xs">Ubah kawasan kejiranan atau jarak carian</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setPersonaModalVisible(true)}
            className="flex-row items-center p-4"
          >
            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
              <Users size={20} color="#2563eb" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-gray-900 text-sm font-bold">Tukar Pengguna Demo (FYP Viva)</Text>
              <Text className="text-gray-400 text-xs">Simulasi peranan Aisyah, Abu, atau Siti</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Demo Persona Switcher Modal */}
      <Modal visible={personaModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-1">Tukar Pengguna Demo</Text>
            <Text className="text-gray-500 text-xs mb-4">
              Pilih profil untuk menguji interaksi antara jiran yang berbeza dalam aplikasi.
            </Text>

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
                  <Text className="text-sm font-bold text-gray-900">{u.name}</Text>
                  <Text className="text-gray-500 text-xs">{u.location}</Text>
                  <Text className="text-green-700 font-semibold text-[11px]">{u.greenPoints} Mata Hijau</Text>
                </View>
                {currentUser.id === u.id && <Check size={20} color="#16a34a" />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setPersonaModalVisible(false)}
              className="mt-3 py-3 rounded-2xl items-center bg-gray-100"
            >
              <Text className="text-gray-700 font-bold text-sm">Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rewards Catalog Modal */}
      <Modal visible={rewardModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Gift size={22} color="#ca8a04" />
                <Text className="text-xl font-bold text-gray-900 ml-2">Katalog Ganjaran Lestari</Text>
              </View>
              <TouchableOpacity onPress={() => setRewardModalVisible(false)}>
                <Text className="text-gray-500 font-bold">Tutup</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-500 text-xs mb-4">
              Tebus Mata Hijau yang dikumpul untuk baucar diskaun daripada rakan penaja komuniti!
            </Text>

            <View className="bg-green-50 p-4 rounded-2xl mb-4 border border-green-200 flex-row justify-between items-center">
              <Text className="text-green-900 font-bold text-sm">Baki Mata Hijau Anda:</Text>
              <Text className="text-green-700 font-black text-xl">{currentUser.greenPoints} pts</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Baucar RM5 Kedai Runcit Mesra Komuniti', cost: 100, sponsor: 'Koperasi Komuniti Melati' },
                { name: 'Diskaun 15% Pusat Servis Basikal Hijau', cost: 150, sponsor: 'Green Ride Skudai' },
                { name: 'Beg Kitar Semula Edisi Khas NeighbourLoop', cost: 80, sponsor: 'Majlis Bandaraya' },
                { name: 'Sijil Penghargaan Wira Kelestarian Kejiranan', cost: 200, sponsor: 'NGO Prihatin Lestari' },
              ].map((reward, i) => (
                <View key={i} className="bg-gray-50 p-3.5 rounded-2xl mb-3 border border-gray-200">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-sm font-bold text-gray-900 flex-1 mr-2">{reward.name}</Text>
                    <Text className="text-xs font-black text-green-700">{reward.cost} pts</Text>
                  </View>
                  <Text className="text-gray-400 text-xs mt-1">Ditaja oleh: {reward.sponsor}</Text>
                  <TouchableOpacity
                    disabled={currentUser.greenPoints < reward.cost}
                    className={`mt-3 py-2 rounded-xl items-center ${
                      currentUser.greenPoints >= reward.cost ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${currentUser.greenPoints >= reward.cost ? 'text-white' : 'text-gray-400'}`}>
                      {currentUser.greenPoints >= reward.cost ? 'Tebus Sekarang' : 'Mata Belum Mencukupi'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </SafeAreaView>
  );
}
