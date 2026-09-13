import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { 
  MapPin, 
  Leaf, 
  ShoppingCart, 
  Recycle, 
  HeartHandshake, 
  ChevronRight, 
  Sparkles,
  Award
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import LocationModal from '../../components/LocationModal';

export default function HomeDashboard() {
  const { currentUser, activities } = useUserStore();
  const router = useRouter();
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Location Bar */}
      <View className="flex-row justify-between items-center px-5 pt-3 pb-2 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => setLocationModalVisible(true)}
          className="flex-row items-center bg-green-50/80 px-3 py-1.5 rounded-full border border-green-200"
        >
          <MapPin size={16} color="#16a34a" />
          <Text className="text-gray-900 font-bold ml-1.5 text-xs max-w-[200px]" numberOfLines={1}>
            {currentUser.location}
          </Text>
          <Text className="text-green-700 font-semibold text-xs ml-1">
            ({currentUser.radiusKm || 5}km)
          </Text>
          <ChevronRight size={14} color="#16a34a" className="ml-0.5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={{ uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }} 
            className="w-10 h-10 rounded-full border-2 border-green-500"
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* User Greeting & Tagline */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-gray-900">
            Hai, {currentUser.name}! 👋
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">
            Connect. Share. Reuse. Sustain.
          </Text>
        </View>

        {/* Green Points Card (Gamification Highlight) */}
        <View className="bg-gradient-to-r from-green-600 to-emerald-700 bg-green-700 rounded-3xl p-5 mb-6 shadow-md shadow-green-900/20 text-white">
          <View className="flex-row justify-between items-start">
            <View>
              <View className="flex-row items-center bg-white/20 self-start px-2.5 py-1 rounded-full mb-2">
                <Sparkles size={14} color="#fef08a" />
                <Text className="text-yellow-200 text-xs font-bold ml-1">Ahli Lestari Aktif</Text>
              </View>
              <Text className="text-white text-3xl font-black">{currentUser.greenPoints} <Text className="text-xl font-normal">pts</Text></Text>
              <Text className="text-green-100 text-xs mt-1">Terkumpul melalui kitar semula, jualan & bantuan</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
              <Leaf size={28} color="#ffffff" />
            </View>
          </View>
        </View>

        {/* 3 Core Pillars Section (From FYP Proposal) */}
        <Text className="text-lg font-bold text-gray-900 mb-3">3 Fungsi Utama</Text>
        <View className="flex-row justify-between mb-6">
          {/* Marketplace */}
          <TouchableOpacity 
            onPress={() => router.push('/marketplace')}
            className="w-[31%] bg-blue-50/90 rounded-2xl p-3.5 items-center border border-blue-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl bg-blue-500 items-center justify-center mb-2 shadow-sm shadow-blue-500/30">
              <ShoppingCart size={24} color="#ffffff" />
            </View>
            <Text className="text-xs font-bold text-blue-900 text-center">Marketplace</Text>
            <Text className="text-[10px] text-blue-600 text-center mt-0.5">Jual & Beli</Text>
          </TouchableOpacity>

          {/* Smart Recycle & Donate */}
          <TouchableOpacity 
            onPress={() => router.push('/recycle')}
            className="w-[31%] bg-green-50/90 rounded-2xl p-3.5 items-center border border-green-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl bg-green-600 items-center justify-center mb-2 shadow-sm shadow-green-600/30">
              <Recycle size={24} color="#ffffff" />
            </View>
            <Text className="text-xs font-bold text-green-900 text-center">Donate & Recycle</Text>
            <Text className="text-[10px] text-green-700 text-center mt-0.5">Sistem Pintar</Text>
          </TouchableOpacity>

          {/* Help Nearby */}
          <TouchableOpacity 
            onPress={() => router.push('/help')}
            className="w-[31%] bg-purple-50/90 rounded-2xl p-3.5 items-center border border-purple-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl bg-purple-600 items-center justify-center mb-2 shadow-sm shadow-purple-600/30">
              <HeartHandshake size={24} color="#ffffff" />
            </View>
            <Text className="text-xs font-bold text-purple-900 text-center">Help Nearby</Text>
            <Text className="text-[10px] text-purple-700 text-center mt-0.5">Bantuan Jiran</Text>
          </TouchableOpacity>
        </View>

        {/* SDG Sustainable Impact Banner */}
        <View className="bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-200">
          <View className="flex-row items-center mb-1.5">
            <Award size={18} color="#059669" />
            <Text className="text-emerald-800 font-bold ml-1.5 text-sm">Menyokong Matlamat SDG PBB</Text>
          </View>
          <Text className="text-emerald-700 text-xs leading-4">
            NeighbourLoop menyokong <Text className="font-bold">SDG 12</Text> (Guna Semula), <Text className="font-bold">SDG 11</Text> (Komuniti Lestari), dan <Text className="font-bold">SDG 13</Text> (Tindakan Iklim) dalam kejiranan anda.
          </Text>
        </View>

        {/* Recent Community Activity Feed */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900">Aktiviti Komuniti Terkini</Text>
          <Text className="text-xs text-green-600 font-semibold">Kawasan Sekitar</Text>
        </View>

        <View className="bg-gray-50 rounded-2xl p-3 border border-gray-200 mb-8">
          {activities.map((act) => {
            let IconComp = ShoppingCart;
            let iconBg = 'bg-blue-100 text-blue-600';
            let iconColor = '#2563eb';

            if (act.category === 'recycle' || act.category === 'donation') {
              IconComp = Recycle;
              iconBg = 'bg-green-100';
              iconColor = '#16a34a';
            } else if (act.category === 'help') {
              IconComp = HeartHandshake;
              iconBg = 'bg-purple-100';
              iconColor = '#9333ea';
            }

            return (
              <View key={act.id} className="flex-row items-center p-2.5 border-b border-gray-100 last:border-b-0">
                <View className={`w-9 h-9 rounded-xl ${iconBg} items-center justify-center mr-3`}>
                  <IconComp size={18} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-xs leading-4">{act.title}</Text>
                  <Text className="text-gray-400 text-[10px]">{act.timestamp}</Text>
                </View>
                <View className="bg-green-100/70 px-2 py-0.5 rounded-full">
                  <Text className="text-green-700 font-bold text-[11px]">+{act.pointsEarned} mata</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Location Selector Modal */}
      <LocationModal 
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </SafeAreaView>
  );
}
