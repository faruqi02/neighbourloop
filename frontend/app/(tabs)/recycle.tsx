import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { useRecycleStore } from '../../store/useRecycleStore';

export default function RecycleScreen() {
  const [item, setItem] = useState('');
  const { centers } = useRecycleStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 bg-blue-500 h-20 justify-center">
        <Text className="text-2xl font-bold text-white text-center">Recycle</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 bg-[#f8fafc]">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Apa yang anda ingin kitar semula?</Text>
        
        <TextInput 
          placeholder="Contoh: Elektronik, Plastik, Kaca"
          className="bg-white rounded-xl px-4 py-4 mb-8 text-base text-gray-800 border border-gray-200 shadow-sm"
          value={item}
          onChangeText={setItem}
        />

        <Text className="text-xl font-bold text-gray-800 mb-4">Lokasi Pusat Kitar Semula</Text>

        {/* Fake Map area */}
        <View className="bg-gray-200 rounded-t-2xl h-40 items-center justify-center mb-0 overflow-hidden relative border border-gray-200 border-b-0">
           {/* Mock map placeholders */}
           <View className="absolute top-8 left-10"><MapPin size={32} color="#ef4444" fill="#fca5a5" /></View>
           <View className="absolute top-16 left-1/2 -ml-4"><MapPin size={32} color="#22c55e" fill="#86efac" /></View>
           <View className="absolute top-6 right-12"><MapPin size={32} color="#3b82f6" fill="#93c5fd" /></View>
        </View>

        {/* Locations List */}
        {centers.map(center => (
          <TouchableOpacity key={center.id} className="bg-white p-5 rounded-b-2xl mb-4 border border-gray-200 border-t-0 flex-row items-center justify-between shadow-sm">
            <View>
              <Text className="text-lg font-bold text-gray-800">{center.name}</Text>
              <Text className="text-gray-500 text-sm mt-1 mb-2">{center.distance} km</Text>
              <Text className="text-gray-600 text-sm">Buka: {center.operatingHours}</Text>
            </View>
            <ChevronRight size={24} color="#9ca3af" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
