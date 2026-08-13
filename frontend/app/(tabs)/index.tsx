import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { MapPin, Leaf, ShoppingCart, Recycle, HeartHandshake } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeDashboard() {
  const { currentUser } = useUserStore();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-5 pt-4">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm">Lokasi Semasa</Text>
            <View className="flex-row items-center">
              <MapPin size={16} color="#16a34a" />
              <Text className="text-black font-semibold ml-1">{currentUser?.location}</Text>
            </View>
          </View>
          <Image 
            source={{ uri: currentUser?.avatarUrl || 'https://via.placeholder.com/40' }} 
            className="w-10 h-10 rounded-full"
          />
        </View>

        {/* Greeting & Green Points */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Hai, {currentUser?.name}!</Text>
          <View className="mt-3 bg-green-50 rounded-xl p-4 flex-row items-center justify-between border border-green-100">
            <View className="flex-row items-center">
              <Leaf size={24} color="#16a34a" />
              <Text className="ml-2 text-lg font-semibold text-green-700">Mata Hijau</Text>
            </View>
            <Text className="text-2xl font-bold text-green-700">{currentUser?.greenPoints} pts</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Aktiviti Komuniti</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="bg-blue-50 w-[31%] rounded-xl p-3 items-center justify-center border border-blue-100"
            onPress={() => router.push('/marketplace')}
          >
            <ShoppingCart size={28} color="#2563eb" />
            <Text className="mt-2 text-xs font-semibold text-blue-700 text-center">Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-green-50 w-[31%] rounded-xl p-3 items-center justify-center border border-green-100"
            onPress={() => router.push('/recycle')}
          >
            <Recycle size={28} color="#16a34a" />
            <Text className="mt-2 text-xs font-semibold text-green-700 text-center">Kitar Semula</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-purple-50 w-[31%] rounded-xl p-3 items-center justify-center border border-purple-100"
            onPress={() => router.push('/help')}
          >
            <HeartHandshake size={28} color="#9333ea" />
            <Text className="mt-2 text-xs font-semibold text-purple-700 text-center">Bantuan</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Feed */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Aktiviti Terkini</Text>
        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-10">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
              <ShoppingCart size={16} color="#2563eb" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-800 font-semibold text-sm">Ali menjual Meja Belajar</Text>
              <Text className="text-gray-500 text-xs">2 minit lalu</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
              <Recycle size={16} color="#16a34a" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-800 font-semibold text-sm">Siti menderma Pakaian</Text>
              <Text className="text-gray-500 text-xs">15 minit lalu</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
              <HeartHandshake size={16} color="#9333ea" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-800 font-semibold text-sm">Abu menawarkan bantuan pindah</Text>
              <Text className="text-gray-500 text-xs">1 jam lalu</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
