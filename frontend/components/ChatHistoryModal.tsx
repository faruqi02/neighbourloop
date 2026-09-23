import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MessageSquare, ChevronRight, Clock, Tag } from 'lucide-react-native';
import { useChatStore } from '../store/useChatStore';
import { ChatConversation } from '../types';
import ChatModal from './ChatModal';

interface ChatHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatHistoryModal({ visible, onClose }: ChatHistoryModalProps) {
  const { conversations, fetchConversations, loading } = useChatStore();
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);

  useEffect(() => {
    if (visible) {
      fetchConversations();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 py-4 border-b border-gray-200 flex-row justify-between items-center bg-white">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3 border border-green-200">
              <MessageSquare size={20} color="#16a34a" />
            </View>
            <View>
              <Text className="text-xl font-black text-gray-900">Sejarah Mesej</Text>
              <Text className="text-xs text-gray-400">Perbualan anda bersama jiran</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Conversations List */}
        <ScrollView className="flex-1 bg-gray-50 px-4 pt-3" showsVerticalScrollIndicator={false}>
          {loading && conversations.length === 0 ? (
            <View className="items-center justify-center py-24">
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="text-gray-500 mt-4">Memuatkan mesej...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View className="items-center justify-center py-24">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                <MessageSquare size={32} color="#9ca3af" />
              </View>
              <Text className="text-base font-bold text-gray-700">Tiada Sejarah Mesej</Text>
              <Text className="text-xs text-gray-400 text-center mt-1 px-8">
                Mulakan perbualan dengan jiran melalui iklan Marketplace, barang derma, atau bantuan komuniti.
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
                  source={{
                    uri: conv.participantAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  }}
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
                        {conv.itemContextPrice !== undefined ? ` • RM ${conv.itemContextPrice}` : ''}
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

        {/* Selected Active Chat Modal */}
        {selectedConversation && (
          <ChatModal
            visible={true}
            onClose={() => setSelectedConversation(null)}
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
    </Modal>
  );
}

