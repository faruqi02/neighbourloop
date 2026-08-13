import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHelpStore } from '../../store/useHelpStore';

export default function HelpScreen() {
  const [activeTab, setActiveTab] = useState<'Permintaan' | 'Tawaran'>('Permintaan');
  const { requests } = useHelpStore();

  const filteredRequests = requests.filter(req => req.type === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-[#6b21a8] justify-center items-center">
        <Text className="text-2xl font-bold text-white mb-1">Help Nearby</Text>
        <Text className="text-purple-200 text-sm">Minta atau berikan bantuan</Text>
      </View>

      <View className="flex-1 bg-[#f8fafc] px-5 -mt-4">
        {/* Tabs */}
        <View className="flex-row bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'Permintaan' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
            onPress={() => setActiveTab('Permintaan')}
          >
            <Text className={`font-semibold ${activeTab === 'Permintaan' ? 'text-gray-900' : 'text-gray-500'}`}>Permintaan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'Tawaran' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
            onPress={() => setActiveTab('Tawaran')}
          >
            <Text className={`font-semibold ${activeTab === 'Tawaran' ? 'text-gray-900' : 'text-gray-500'}`}>Tawaran</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView className="flex-1">
          {filteredRequests.map(req => (
            <View key={req.id} className="bg-white p-4 rounded-xl mb-4 flex-row items-center border border-gray-100 shadow-sm shadow-gray-200">
              <Image 
                source={{ uri: 'https://via.placeholder.com/50' }} 
                className="w-14 h-14 rounded-full bg-gray-200"
              />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-gray-800">{req.title}</Text>
                <Text className="text-gray-500 text-sm mt-1">{req.distance} km</Text>
              </View>
            </View>
          ))}
          <View className="h-24" />
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 left-5 right-5 h-14 bg-[#6b21a8] rounded-full items-center justify-center shadow-lg shadow-purple-900/50">
        <Text className="text-white font-bold text-lg">+ Buat {activeTab}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
