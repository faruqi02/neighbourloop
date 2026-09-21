import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { useNoticeStore } from '../../store/useNoticeStore';
import { 
  MapPin, 
  ShoppingCart, 
  HeartHandshake, 
  ChevronRight, 
  Bell, 
  Calendar, 
  Clock, 
  Users, 
  PlusCircle,
  Megaphone
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import LocationModal from '../../components/LocationModal';
import NoticeDetailModal from '../../components/NoticeDetailModal';
import { CommunityNotice } from '../../types';

const recycleIcon = require('../../images/recycle_icon.png');

export default function HomeDashboard() {
  const { currentUser } = useUserStore();
  const { notices } = useNoticeStore();
  const router = useRouter();

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<CommunityNotice | null>(null);

  if (!currentUser) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Location Bar */}
      <View className="flex-row justify-between items-center px-5 pt-3 pb-2 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => setLocationModalVisible(true)}
          className="flex-row items-center bg-green-50/90 px-3 py-1.5 rounded-full border border-green-200"
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
            className="w-10 h-10 rounded-full border-2 border-green-600"
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
            Komuniti Prihatin. Kongsi Sumber. Saling Membantu.
          </Text>
        </View>

        {/* Welcome Community Banner (Clean, no points, no SDG) */}
        <View className="bg-gradient-to-r from-emerald-600 to-green-700 bg-green-700 rounded-3xl p-5 mb-6 shadow-md shadow-green-900/20">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center bg-white/20 self-start px-2.5 py-1 rounded-full mb-2">
                <Users size={14} color="#ffffff" />
                <Text className="text-white text-xs font-bold ml-1.5">Zon Komuniti Aktif</Text>
              </View>
              <Text className="text-white text-xl font-black">{currentUser.location}</Text>
              <Text className="text-green-100 text-xs mt-1 leading-4">
                Platform kejiranan setempat untuk jual beli preloved, derma barangan, dan bantuan sesama jiran.
              </Text>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center p-2">
              <Image source={recycleIcon} className="w-11 h-11" resizeMode="contain" />
            </View>
          </View>
        </View>

        {/* 3 Core Pillars Section */}
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

          {/* Smart Recycle & Donate with custom recycle_icon.png */}
          <TouchableOpacity 
            onPress={() => router.push('/recycle')}
            className="w-[31%] bg-green-50/90 rounded-2xl p-3.5 items-center border border-green-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl bg-green-600 items-center justify-center mb-2 shadow-sm shadow-green-600/30">
              <Image source={recycleIcon} className="w-8 h-8" resizeMode="contain" />
            </View>
            <Text className="text-xs font-bold text-green-900 text-center">Donate & Recycle</Text>
            <Text className="text-[10px] text-green-700 text-center mt-0.5">Derma & Kitar</Text>
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

        {/* Informasi Komuniti (Gotong-Royong, Kerja Baiki Jalan, dsb) */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Megaphone size={18} color="#059669" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Informasi Komuniti</Text>
          </View>
          <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Text className="text-xs text-emerald-800 font-bold">{notices.length} Notis Semasa</Text>
          </View>
        </View>

        <View className="mb-8">
          {notices.map((item) => {
            let catBg = 'bg-emerald-100 text-emerald-800';
            let catBorder = 'border-emerald-200';
            let catText = 'text-emerald-800';

            if (item.category === 'Penyelenggaraan') {
              catBg = 'bg-amber-100';
              catBorder = 'border-amber-200';
              catText = 'text-amber-800';
            } else if (item.category === 'Keselamatan') {
              catBg = 'bg-blue-100';
              catBorder = 'border-blue-200';
              catText = 'text-blue-800';
            }

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedNotice(item)}
                className="bg-white rounded-2xl p-4 mb-3.5 border border-gray-200 shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <View className={`px-2.5 py-0.5 rounded-md border ${catBg} ${catBorder}`}>
                    <Text className={`text-[10px] font-bold ${catText}`}>{item.category}</Text>
                  </View>
                  <Text className="text-gray-400 text-[11px]">{item.createdAt}</Text>
                </View>

                <Text className="text-base font-bold text-gray-900 mb-1.5 leading-5">
                  {item.title}
                </Text>

                <Text className="text-gray-600 text-xs mb-3 leading-4" numberOfLines={2}>
                  {item.description}
                </Text>

                <View className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <View className="flex-row items-center mb-1">
                    <Calendar size={13} color="#059669" />
                    <Text className="text-[11px] font-semibold text-gray-700 ml-1.5">{item.date}</Text>
                    {item.time ? (
                      <>
                        <Text className="text-gray-300 mx-1.5">•</Text>
                        <Clock size={13} color="#059669" />
                        <Text className="text-[11px] font-semibold text-gray-700 ml-1.5">{item.time}</Text>
                      </>
                    ) : null}
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={13} color="#dc2626" />
                    <Text className="text-[11px] text-gray-600 ml-1.5 font-medium" numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-gray-100">
                  <Text className="text-[11px] text-gray-500 font-medium">
                    Oleh: <Text className="text-gray-800 font-semibold">{item.organizer}</Text>
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs font-bold text-emerald-700 mr-0.5">Lihat Butiran</Text>
                    <ChevronRight size={14} color="#047857" />
                  </View>
                </View>
              </TouchableOpacity>
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

      {/* Community Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </SafeAreaView>
  );
}
