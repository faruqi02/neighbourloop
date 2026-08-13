import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { Leaf, Settings, ChevronRight, ShoppingCart, Recycle, HeartHandshake } from 'lucide-react-native';

export default function ProfileScreen() {
  const { currentUser } = useUserStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-4 flex-row justify-between items-center border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Profil</Text>
        <TouchableOpacity>
          <Settings size={24} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        
        {/* Profile Card */}
        <View className="bg-white p-5 items-center justify-center border-b border-gray-100 mb-2">
          <Image 
            source={{ uri: currentUser?.avatarUrl || 'https://via.placeholder.com/100' }} 
            className="w-24 h-24 rounded-full bg-gray-200 mb-4"
          />
          <Text className="text-2xl font-bold text-gray-800">{currentUser?.name}</Text>
          <Text className="text-gray-500">{currentUser?.email}</Text>
          
          <View className="bg-green-100 mt-4 px-4 py-2 rounded-full flex-row items-center">
            <Leaf size={18} color="#16a34a" />
            <Text className="text-green-700 font-bold ml-2">{currentUser?.greenPoints} Mata Hijau</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="bg-white p-5 flex-row justify-between border-b border-gray-100 mb-4">
          <View className="items-center flex-1 border-r border-gray-200">
            <Text className="text-2xl font-bold text-blue-600">4</Text>
            <Text className="text-gray-500 text-xs mt-1">Listing</Text>
          </View>
          <View className="items-center flex-1 border-r border-gray-200">
            <Text className="text-2xl font-bold text-green-600">12</Text>
            <Text className="text-gray-500 text-xs mt-1">Kitar Semula</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-purple-600">8</Text>
            <Text className="text-gray-500 text-xs mt-1">Bantuan</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white border-t border-b border-gray-100 mb-6">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
              <ShoppingCart size={20} color="#2563eb" />
            </View>
            <Text className="flex-1 ml-4 text-gray-800 text-lg font-semibold">Listing Saya</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
              <Recycle size={20} color="#16a34a" />
            </View>
            <Text className="flex-1 ml-4 text-gray-800 text-lg font-semibold">Sejarah Kitar Semula</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
              <HeartHandshake size={20} color="#9333ea" />
            </View>
            <Text className="flex-1 ml-4 text-gray-800 text-lg font-semibold">Aktiviti Bantuan</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
