import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, HeartHandshake, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useListingStore } from '../../store/useListingStore';
import { useHelpStore } from '../../store/useHelpStore';

export default function ExplorerScreen() {
  const router = useRouter();
  const { listings } = useListingStore();
  const { requests } = useHelpStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-4 bg-emerald-600">
        <Text className="text-2xl font-black text-white text-center">Explorer</Text>
        <Text className="text-emerald-100 text-xs text-center mt-0.5">
          Terokai Marketplace dan Bantuan Jiran Terkini
        </Text>
      </View>
      <ScrollView className="flex-1 px-5 pt-4 bg-gray-50 -mt-3 rounded-t-3xl" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900">Barangan Jualan Terkini</Text>
          <TouchableOpacity onPress={() => router.push('/marketplace')}>
            <Text className="text-emerald-600 font-bold text-xs">Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {listings.slice(0, 2).map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => router.push('/marketplace')}
            className="bg-white rounded-2xl p-4 mb-3 flex-row border border-gray-100"
          >
            <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-xl bg-gray-100" />
            <View className="ml-3 flex-1 justify-center">
              <Text className="font-bold text-gray-900 mb-1">{item.title}</Text>
              <Text className="text-emerald-600 font-bold">RM {item.price}</Text>
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View className="flex-row justify-between items-center mt-4 mb-3">
          <Text className="text-lg font-bold text-gray-900">Bantuan Diperlukan</Text>
          <TouchableOpacity onPress={() => router.push('/help')}>
            <Text className="text-purple-600 font-bold text-xs">Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {requests.slice(0, 2).map((req) => (
          <TouchableOpacity 
            key={req.id}
            onPress={() => router.push('/help')}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-purple-900">{req.title}</Text>
              <View className="bg-purple-100 px-2 py-0.5 rounded-md">
                <Text className="text-[10px] text-purple-700 font-bold">{req.category}</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>{req.description}</Text>
            <View className="flex-row items-center">
              <MapPin size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">{req.distance} km</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
