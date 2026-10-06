import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Clock, ChevronRight, Tag } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { useChatStore } from '../../store/useChatStore';
import ChatModal from '../../components/ChatModal';
import { ChatConversation } from '../../types';

export default function ChatScreen() {
  const { conversations, fetchConversations, loading } = useChatStore();
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh and poll every 3.5s while the Chat tab is actively focused
  useFocusEffect(
    useCallback(() => {
      fetchConversations(true);

      const interval = setInterval(() => {
        fetchConversations(true);
      }, 3500);

      return () => clearInterval(interval);
    }, [fetchConversations])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-4 bg-emerald-600">
        <Text className="text-2xl font-black text-white text-center">Chatbox Komuniti</Text>
        <Text className="text-emerald-100 text-xs text-center mt-0.5">
          Berhubung terus untuk urusan barang atau bantuan
        </Text>
      </View>
      <View className="flex-1 bg-gray-50 -mt-3 rounded-t-3xl">
        <ScrollView 
          className="flex-1 px-4 pt-5" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#059669']}
              tintColor="#059669"
            />
          }
        >
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
                Setiap perbualan dari Marketplace, Bantuan atau Derma akan dipaparkan di sini mengikut setiap barang.
              </Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => setSelectedConversation(conv)}
                className="bg-white p-3.5 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center"
              >
                <View className="relative mr-3">
                  <Image
                    source={{ uri: conv.participantAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    className="bg-gray-200 border border-gray-100"
                  />
                  {conv.itemContextImage ? (
                    <Image
                      source={{ uri: conv.itemContextImage }}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        borderWidth: 1.5,
                        borderColor: '#ffffff',
                      }}
                    />
                  ) : null}
                </View>
                <View className="flex-1 mr-2">
                  <View className="flex-row justify-between items-center mb-0.5">
                    <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                      {conv.participantName}
                    </Text>
                    <View className="flex-row items-center">
                      <Clock size={10} color="#9ca3af" />
                      <Text className="text-[11px] text-gray-400 ml-1">{conv.lastMessageTime}</Text>
                    </View>
                  </View>
                  {conv.itemContextTitle ? (
                    <View className="flex-row items-center bg-emerald-50 self-start px-2 py-0.5 rounded-md mb-1 border border-emerald-100 max-w-[95%]">
                      <Tag size={10} color="#059669" />
                      <Text className="text-[10px] font-bold text-emerald-800 ml-1 mr-1.5" numberOfLines={1}>
                        {conv.itemContextTitle}
                      </Text>
                      {conv.itemContextPrice != null && Number(conv.itemContextPrice) > 0 ? (
                        <Text className="text-[10px] font-black text-emerald-700">
                          RM{Number(conv.itemContextPrice).toFixed(0)}
                        </Text>
                      ) : conv.itemContextPrice === 0 ? (
                        <Text className="text-[9px] font-bold text-purple-700">
                          Percuma
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-gray-500 font-medium flex-1 mr-2" numberOfLines={1}>
                      {conv.lastMessage}
                    </Text>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <View className="bg-emerald-600 rounded-full px-2 py-0.5 min-w-[20px] items-center justify-center">
                        <Text className="text-[10px] font-bold text-white">{conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
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
                  id: selectedConversation.itemContextId,
                  title: selectedConversation.itemContextTitle,
                  price: selectedConversation.itemContextPrice != null ? Number(selectedConversation.itemContextPrice) : undefined,
                  category: selectedConversation.itemContextCategory,
                  imageUrl: selectedConversation.itemContextImage,
                  condition: selectedConversation.itemContextCondition,
                }
              : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

