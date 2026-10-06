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
  Linking,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Phone, MessageSquare, Check, CheckCheck, Tag, MapPin } from 'lucide-react-native';
import { useChatStore } from '../store/useChatStore';
import { useUserStore } from '../store/useUserStore';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    phone?: string;
    distance?: number;
    radiusKm?: number;
  };
  itemContext?: {
    id?: string;
    title: string;
    price?: number | string;
    category?: string;
    imageUrl?: string;
    condition?: string;
    distance?: number;
    radiusKm?: number;
  };
}

const QUICK_REPLIES = [
  'Adakah masih ada / masih boleh diambil?',
  'Boleh COD di sekitar kawasan kejiranan?',
  'Bila masa lapang untuk saya datang ambil?',
  'Terima kasih banyak!',
];

export default function ChatModal({
  visible,
  onClose,
  recipient,
  itemContext,
}: ChatModalProps) {
  const { currentUser, allUsers, fetchUsers } = useUserStore();
  const { conversations, getOrCreateConversation, sendMessage, markAsRead, fetchConversations } = useChatStore();
  const insets = useSafeAreaInsets();

  const [conversationId, setConversationId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const textRef = useRef<string>('');

  const ctxTitle = itemContext?.title;
  const ctxPrice = itemContext?.price;
  const ctxCategory = itemContext?.category;

  // Resolve Seller Username & Range Radius
  const sellerUser = allUsers.find((u) => u.id === recipient.id);
  const rawUsername = (
    recipient.username || 
    sellerUser?.username || 
    (recipient.name && recipient.name !== 'Jiran' ? recipient.name : '') || 
    sellerUser?.name || 
    'seller'
  ).replace(/^@/, '');
  const sellerUsername = `@${rawUsername}`;

  const displayRadius = recipient.radiusKm || sellerUser?.radiusKm || itemContext?.radiusKm || currentUser?.radiusKm || 5;
  const displayDistance = itemContext?.distance !== undefined 
    ? itemContext.distance 
    : (recipient.distance !== undefined ? recipient.distance : 0.5);

  // Load latest users so recipient username is always up-to-date
  useEffect(() => {
    if (visible) {
      fetchUsers?.();
    }
  }, [visible]);

  // Real-time polling while ChatModal is open so recipient automatically sees new messages!
  useEffect(() => {
    if (!visible) return;

    // Immediately fetch latest messages silently
    fetchConversations(true);

    // Auto-poll every 2.5 seconds silently
    const pollInterval = setInterval(() => {
      fetchConversations(true);
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [visible]);

  // Track keyboard visibility for exact input bar alignment
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const currentConv = conversations.find((c) => c.id === conversationId);
  const messages = currentConv?.messages || [];

  const activeItem = itemContext || (currentConv?.itemContextTitle ? {
    id: currentConv.itemContextId,
    title: currentConv.itemContextTitle,
    price: currentConv.itemContextPrice,
    category: currentConv.itemContextCategory,
    imageUrl: currentConv.itemContextImage,
    condition: currentConv.itemContextCondition,
  } : undefined);

  useEffect(() => {
    if (visible && recipient.id) {
      const convId = getOrCreateConversation(
        {
          id: recipient.id,
          name: sellerUsername,
          avatarUrl: recipient.avatarUrl || sellerUser?.avatarUrl,
          phone: recipient.phone || sellerUser?.phone,
        }, 
        activeItem
          ? {
              id: activeItem.id,
              title: activeItem.title,
              price: activeItem.price !== undefined ? Number(activeItem.price) : undefined,
              category: activeItem.category,
              imageUrl: activeItem.imageUrl,
              condition: activeItem.condition,
            }
          : undefined
      );
      setConversationId(convId);
      markAsRead(convId, recipient.id);
    }
  }, [visible, recipient.id, sellerUsername, itemContext?.id, itemContext?.title, itemContext?.price, itemContext?.imageUrl]);

  // When modal is open and incoming messages arrive, mark them as read automatically
  useEffect(() => {
    if (visible && conversationId && recipient.id && messages.length > 0) {
      const hasUnread = messages.some((m) => {
        const isMe = m.isMe || (currentUser ? m.senderId === currentUser.id : false);
        return !isMe && !m.isRead;
      });
      if (hasUnread) {
        markAsRead(conversationId, recipient.id);
      }
    }
  }, [visible, conversationId, recipient.id, messages, currentUser]);

  // Auto-scroll to bottom whenever new message arrives (either sent or received)
  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      prevMsgCountRef.current = messages.length;
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText || textRef.current || '').trim();
    if (!text) return;

    const activeConvId = conversationId || getOrCreateConversation(
      {
        id: recipient.id,
        name: sellerUsername,
        avatarUrl: recipient.avatarUrl || sellerUser?.avatarUrl,
        phone: recipient.phone || sellerUser?.phone,
      }, 
      activeItem
        ? {
            id: activeItem.id,
            title: activeItem.title,
            price: activeItem.price !== undefined ? Number(activeItem.price) : undefined,
            category: activeItem.category,
            imageUrl: activeItem.imageUrl,
            condition: activeItem.condition,
          }
        : undefined
    );

    const senderId = currentUser?.id || 'u1';
    const senderName = currentUser?.username ? `@${currentUser.username}` : (currentUser?.name || 'Saya');

    sendMessage(activeConvId, text, senderId, senderName);
    setInputText('');
    textRef.current = '';
    inputRef.current?.clear();

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleOpenWhatsApp = () => {
    const targetPhone = recipient.phone || sellerUser?.phone;
    if (!targetPhone) return;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
    const url = `whatsapp://send?phone=${internationalPhone}&text=${encodeURIComponent(
      `Salam ${sellerUsername}, saya berminat dengan "${itemContext?.title || 'iklan anda'}" di NeighbourLoop (Radius ${displayRadius} km).`
    )}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${internationalPhone}`);
    });
  };

  const handleCall = () => {
    const targetPhone = recipient.phone || sellerUser?.phone;
    if (!targetPhone) return;
    Linking.openURL(`tel:${targetPhone}`);
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Chat Header */}
          <View 
            className="bg-white px-4 pb-3 border-b border-gray-200 flex-row items-center justify-between shadow-xs"
            style={{
              paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 52) : 14,
            }}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Image
                source={{
                  uri: recipient.avatarUrl || sellerUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                }}
                className="w-10 h-10 rounded-full mr-3 border border-gray-200 bg-gray-100"
              />
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                  {sellerUsername}
                </Text>
                <View className="flex-row items-center flex-wrap mt-0.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  <Text className="text-[11px] text-emerald-800 font-semibold">
                    Radius: {displayRadius} km
                  </Text>
                  <Text className="text-[11px] text-gray-400 mx-1.5">•</Text>
                  <Text className="text-[11px] text-gray-600 font-medium">
                    ~{displayDistance} km dari anda
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons: WhatsApp / Call & Close */}
            <View className="flex-row items-center">
              {(recipient.phone || sellerUser?.phone) ? (
                <>
                  <TouchableOpacity
                    onPress={handleOpenWhatsApp}
                    className="p-2 bg-emerald-50 rounded-full border border-emerald-200 mr-1.5"
                    accessibilityLabel="WhatsApp"
                  >
                    <MessageSquare size={18} color="#059669" />
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

              <TouchableOpacity 
                onPress={onClose} 
                className="p-2 bg-gray-100 rounded-full"
                accessibilityLabel="Tutup Chat"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Top Compact Context Pill */}
          {activeItem?.title ? (
            <View className="bg-emerald-50/90 px-4 py-2 border-b border-emerald-100 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <Tag size={13} color="#059669" />
                <Text className="text-xs font-bold text-emerald-950 ml-1.5" numberOfLines={1}>
                  {activeItem.title}
                </Text>
                {activeItem.price != null && !isNaN(Number(activeItem.price)) ? (
                  <Text className="text-xs font-black text-emerald-700 ml-1.5">
                    RM {Number(activeItem.price).toFixed(0)}
                  </Text>
                ) : null}
              </View>
              <View className="bg-emerald-200/80 px-2 py-0.5 rounded-full flex-row items-center">
                <MapPin size={9} color="#065f46" />
                <Text className="text-[10px] font-bold text-emerald-900 ml-1">
                  Radius {displayRadius} km
                </Text>
              </View>
            </View>
          ) : null}

          {/* Messages Feed */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 py-3 bg-slate-50"
            contentContainerStyle={{ paddingBottom: 15 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Shopee-style Product Inquiry Card (Matching user reference picture) */}
            {activeItem?.title ? (
              <View className="bg-white rounded-2xl p-3.5 mb-3.5 border border-slate-200/90 shadow-sm">
                <Text className="text-xs font-bold text-slate-800 mb-2.5">
                  Anda sedang bertanyakan tentang barang ini
                </Text>

                <View className="flex-row items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Image
                    source={{
                      uri: activeItem.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400'
                    }}
                    className="w-16 h-16 rounded-lg bg-slate-200 mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-center">
                    <Text className="text-xs font-bold text-slate-900 leading-snug" numberOfLines={2}>
                      {activeItem.title}
                    </Text>

                    <View className="flex-row items-center mt-1 flex-wrap">
                      {activeItem.price !== undefined && activeItem.price !== null && !isNaN(Number(activeItem.price)) ? (
                        <Text className="text-xs font-black text-emerald-600 mr-2">
                          RM {Number(activeItem.price).toFixed(2)}
                        </Text>
                      ) : (
                        <Text className="text-[11px] font-black text-purple-700 mr-2">
                          {activeItem.category || 'Barangan Komuniti'}
                        </Text>
                      )}

                      {activeItem.condition ? (
                        <View className="bg-slate-200/90 px-1.5 py-0.5 rounded">
                          <Text className="text-[9px] font-bold text-slate-600">
                            {activeItem.condition}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View className="mt-2.5 pt-2 border-t border-slate-100 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-[10px] text-slate-400 font-semibold mr-1">ID Barang:</Text>
                    <Text className="text-[10px] font-bold text-slate-700">{activeItem.id || 'NL-ITEM'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-[10px] text-slate-400 font-semibold mr-1">Kategori:</Text>
                    <Text className="text-[10px] font-bold text-slate-700">{activeItem.category || 'Marketplace'}</Text>
                  </View>
                </View>

                {messages.length === 0 && (
                  <View className="items-end mt-2.5 pt-2 border-t border-slate-100">
                    <TouchableOpacity
                      onPress={() => handleSend(`Salam, adakah barang '${activeItem.title}' ini masih ada?`)}
                      className="bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-full flex-row items-center shadow-xs"
                      activeOpacity={0.8}
                    >
                      <MessageSquare size={12} color="#059669" />
                      <Text className="text-emerald-800 font-bold text-xs ml-1.5">
                        Chat with Seller
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null}

            <View className="items-center my-2">
              <View className="bg-slate-200/80 px-3 py-1 rounded-full">
                <Text className="text-[11px] text-slate-600 font-medium">
                  Perbualan Komuniti NeighbourLoop • Radius {displayRadius} km
                </Text>
              </View>
            </View>

            {messages.map((msg) => {
              const isMe = msg.isMe || (currentUser ? msg.senderId === currentUser.id : false);
              return (
                <View
                  key={msg.id}
                  className={`mb-2.5 max-w-[82%] ${isMe ? 'self-end' : 'self-start'}`}
                >
                  <View
                    className={`rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-emerald-600 rounded-tr-xs'
                        : 'bg-white rounded-tl-xs border border-gray-200 shadow-xs'
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
                        className={`text-[9px] ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}
                      >
                        {msg.timestamp}
                      </Text>
                      {isMe && (
                        msg.isRead ? (
                          <CheckCheck size={13} color="#67e8f9" style={{ marginLeft: 4 }} />
                        ) : (
                          <Check size={11} color="#bbf7d0" style={{ marginLeft: 4 }} />
                        )
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Replies Carousel */}
          <View className="bg-white border-t border-gray-100 py-2 px-3">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {QUICK_REPLIES.map((reply, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSend(reply)}
                  className="mr-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 active:bg-gray-200"
                >
                  <Text className="text-xs text-gray-700 font-medium">{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bottom Chat Input Bar */}
          <View 
            className="bg-white px-4 pt-2.5 border-t border-gray-200 flex-row items-center"
            style={{ 
              paddingBottom: isKeyboardVisible 
                ? (Platform.OS === 'ios' ? 10 : 10) 
                : Math.max(insets.bottom, 12) 
            }}
          >
            <TextInput
              ref={inputRef}
              placeholder={`Mesej kepada ${sellerUsername}...`}
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={(val) => {
                textRef.current = val;
                setInputText(val);
              }}
              onChange={(e) => {
                const val = e.nativeEvent.text || '';
                textRef.current = val;
                setInputText(val);
              }}
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-900 mr-2 max-h-24"
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              activeOpacity={0.8}
              className="w-11 h-11 rounded-full items-center justify-center shadow-md shadow-emerald-700/30"
              style={{
                backgroundColor: (inputText.trim().length > 0 || textRef.current.trim().length > 0) ? '#059669' : '#10b981',
              }}
            >
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

