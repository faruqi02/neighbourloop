import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-4 bg-emerald-600">
        <Text className="text-2xl font-black text-white text-center">Chatbox Jiran</Text>
        <Text className="text-emerald-100 text-xs text-center mt-0.5">
          Berhubung terus dengan jiran berdekatan
        </Text>
      </View>
      <View className="flex-1 items-center justify-center bg-gray-50 -mt-3 rounded-t-3xl px-6">
        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <MessageCircle size={40} color="#059669" />
        </View>
        <Text className="text-lg font-bold text-gray-900 mb-2">Tiada Mesej Baru</Text>
        <Text className="text-center text-gray-500 text-sm">
          Setiap perbualan dari Marketplace, Bantuan atau Derma akan dipaparkan di sini.
        </Text>
      </View>
    </SafeAreaView>
  );
}
