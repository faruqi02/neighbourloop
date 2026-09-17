import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Phone, MessageSquare, Check, Tag } from 'lucide-react-native';
import { useChatStore } from '../store/useChatStore';
import { useUserStore } from '../store/useUserStore';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatarUrl?: string;
    phone?: string;
  };
  itemContext?: {
    title: string;
    price?: number;
    category?: string;
  };
}

const QUICK_REPLIES = [
  'Adakah masih ada / masih boleh diambil?',
  'Boleh COD di surau / taman perumahan?',
  'Bila masa lapang untuk saya datang ambil?',
  'Terima kasih banyak jiran!',
];

export default function ChatModal({
  visible,
  onClose,
  recipient,
  itemContext,
}: ChatModalProps) {
  const { currentUser } = useUserStore();
  const { conversations, getOrCreateConversation, sendMessage, markAsRead } = useChatStore();

  const [conversationId, setConversationId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && recipient.id) {
      const convId = getOrCreateConversation(recipient, itemContext);
      setConversationId(convId);
      markAsRead(convId);
    }
  }, [visible, recipient.id, itemContext]);

  const currentConv = conversations.find((c) => c.id === conversationId);
  const messages = currentConv?.messages || [];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !conversationId) return;

    sendMessage(conversationId, text, currentUser.id, currentUser.name);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleOpenWhatsApp = () => {
    if (!recipient.phone) return;
    const cleanPhone = recipient.phone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
    const url = `whatsapp://send?phone=${internationalPhone}&text=${encodeURIComponent(
      `Salam ${recipient.name}, saya jiran dari NeighbourLoop mengenai ${itemContext?.title || 'perkara ini'}.`
    )}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${internationalPhone}`);
    });
  };

  const handleCall = () => {
    if (!recipient.phone) return;
    Linking.openURL(`tel:${recipient.phone}`);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          className="flex-1"
        >
          {/* Chat Header */}
          <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center flex-1 mr-2">
              <Image
                source={{
                  uri: recipient.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                }}
                className="w-10 h-10 rounded-full mr-3 border border-gray-200"
              />
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                  {recipient.name}
                </Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-[11px] text-green-700 font-semibold">Aktif Dalam Komuniti</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons: WhatsApp / Call & Close */}
            <View className="flex-row items-center">
              {recipient.phone ? (
                <>
                  <TouchableOpacity
                    onPress={handleOpenWhatsApp}
                    className="p-2 bg-green-50 rounded-full border border-green-200 mr-1.5"
                    accessibilityLabel="WhatsApp"
                  >
                    <MessageSquare size={18} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCall}
                    className="p-2 bg-blue-50 rounded-full border border-blue-200 mr-2"
                    accessibilityLabel="Call"
                  >
                    <Phone size={18} color="#2563eb" />
                  </TouchableOpacity>
                </>
              ) : null}

              <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Context Card: Item / Topic Banner */}
          {itemContext ? (
            <View className="bg-green-50/90 px-4 py-2 border-b border-green-100 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <Tag size={14} color="#16a34a" />
                <Text className="text-xs font-bold text-green-950 ml-1.5" numberOfLines={1}>
                  {itemContext.title}
                </Text>
              </View>
              {itemContext.price !== undefined ? (
                <Text className="text-xs font-black text-green-800">
                  RM {itemContext.price.toFixed(0)}
                </Text>
              ) : (
                <View className="bg-green-200 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-green-800">
                    {itemContext.category || 'Komuniti'}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Messages Feed */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 py-3"
            contentContainerStyle={{ paddingBottom: 15 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <View className="items-center my-2">
              <View className="bg-gray-200/80 px-3 py-1 rounded-full">
                <Text className="text-[11px] text-gray-600 font-medium">
                  Perbualan Selamat Kejiranan NeighbourLoop
                </Text>
              </View>
            </View>

            {messages.map((msg) => {
              const isMe = msg.isMe || msg.senderId === currentUser.id;
              return (
                <View
                  key={msg.id}
                  className={`mb-2.5 max-w-[82%] ${isMe ? 'self-end' : 'self-start'}`}
                >
                  <View
                    className={`rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-green-700 rounded-tr-xs'
                        : 'bg-white rounded-tl-xs border border-gray-200 shadow-sm'
                    }`}
                  >
                    {!isMe && (
                      <Text className="text-[10px] font-bold text-gray-400 mb-0.5">
                        {msg.senderName}
                      </Text>
                    )}
                    <Text
                      className={`text-sm leading-5 ${isMe ? 'text-white font-medium' : 'text-gray-900'}`}
                    >
                      {msg.text}
                    </Text>
                    <View className="flex-row items-center justify-end mt-1">
                      <Text
                        className={`text-[9px] ${isMe ? 'text-green-200' : 'text-gray-400'}`}
                      >
                        {msg.timestamp}
                      </Text>
                      {isMe && <Check size={10} color="#bbf7d0" className="ml-1" />}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Replies Carousel */}
          <View className="bg-white border-t border-gray-100 py-2 px-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_REPLIES.map((reply, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSend(reply)}
                  className="mr-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200"
                >
                  <Text className="text-xs text-gray-700 font-medium">{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bottom Chat Input Bar */}
          <View className="bg-white px-4 py-3 border-t border-gray-200 flex-row items-center">
            <TextInput
              placeholder={`Mesej kepada ${recipient.name}...`}
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900 mr-2"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                inputText.trim() ? 'bg-green-700 shadow-md shadow-green-700/30' : 'bg-gray-200'
              }`}
            >
              <Send size={18} color={inputText.trim() ? '#ffffff' : '#9ca3af'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

