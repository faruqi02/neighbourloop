import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Clock, ChevronRight, Tag } from 'lucide-react-native';
import { useChatStore } from '../../store/useChatStore';
import ChatModal from '../../components/ChatModal';
import { ChatConversation } from '../../types';

export default function ChatScreen() {
  const { conversations, fetchConversations, loading } = useChatStore();
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-4 bg-emerald-600">
        <Text className="text-2xl font-black text-white text-center">Chatbox Jiran</Text>
        <Text className="text-emerald-100 text-xs text-center mt-0.5">
          Berhubung terus dengan jiran berdekatan
        </Text>
      </View>
      <View className="flex-1 bg-gray-50 -mt-3 rounded-t-3xl">
        <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
          {loading && conversations.length === 0 ? (
            <View className="items-center justify-center py-24">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-gray-500 mt-4">Memuatkan mesej...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View className="items-center justify-center py-24">
              <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
                <MessageCircle size={40} color="#059669" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">Tiada Mesej Baru</Text>
              <Text className="text-center text-gray-500 text-sm px-4">
                Setiap perbualan dari Marketplace, Bantuan atau Derma akan dipaparkan di sini.
              </Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => setSelectedConversation(conv)}
                className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center"
              >
                <Image
                  source={{ uri: conv.participantAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
                  className="w-13 h-13 rounded-full mr-3.5 bg-gray-200 border border-gray-100"
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
                <View className="flex-1 mr-2">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                      {conv.participantName}
                    </Text>
                    <View className="flex-row items-center">
                      <Clock size={10} color="#9ca3af" />
                      <Text className="text-[11px] text-gray-400 ml-1">{conv.lastMessageTime}</Text>
                    </View>
                  </View>
                  {conv.itemContextTitle ? (
                    <View className="flex-row items-center bg-green-50 self-start px-2 py-0.5 rounded-md mb-1.5 border border-green-100">
                      <Tag size={10} color="#16a34a" />
                      <Text className="text-[10px] font-bold text-green-800 ml-1" numberOfLines={1}>
                        {conv.itemContextTitle}
                      </Text>
                    </View>
                  ) : null}
                  <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                </View>
                <ChevronRight size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))
          )}
          <View className="h-12" />
        </ScrollView>
      </View>

      {/* Selected Active Chat Modal */}
      {selectedConversation && (
        <ChatModal
          visible={true}
          onClose={() => {
             setSelectedConversation(null);
             fetchConversations();
          }}
          recipient={{
            id: selectedConversation.participantId,
            name: selectedConversation.participantName,
            avatarUrl: selectedConversation.participantAvatar,
            phone: selectedConversation.participantPhone,
          }}
          itemContext={
            selectedConversation.itemContextTitle
              ? {
                  title: selectedConversation.itemContextTitle,
                  price: selectedConversation.itemContextPrice,
                  category: selectedConversation.itemContextCategory,
                }
              : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

