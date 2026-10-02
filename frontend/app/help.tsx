import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Pressable,
  TextInput, 
  Modal, 
  Image, 
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { 
  HeartHandshake, 
  Plus, 
  MapPin, 
  X, 
  User, 
  Tag, 
  Phone, 
  MessageSquare, 
  CheckCircle2,
  ChevronLeft,
  Trash2
} from 'lucide-react-native';
import { useHelpStore } from '../store/useHelpStore';
import { useUserStore } from '../store/useUserStore';
import { HelpRequest } from '../types';
import SuccessModal from '../components/SuccessModal';
import ImagePickerButton from '../components/ImagePickerButton';
import ChatModal from '../components/ChatModal';

const CATEGORIES = ['Semua', 'Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain'];
const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400',
  'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400',
  'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400',
];

export default function HelpScreen() {
  const { requests, addRequest, fulfillRequest, deleteRequest, fetchHelpRequests, loading } = useHelpStore();
  const { currentUser, allUsers, fetchUsers } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    fetchHelpRequests();
    fetchUsers?.();
  }, []);

  const [activeTab, setActiveTab] = useState<'Permintaan' | 'Tawaran'>('Permintaan');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  // Create Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newType, setNewType] = useState<'Permintaan' | 'Tawaran'>('Permintaan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Pinjam Barang' | 'Khidmat/Tenaga' | 'Kemahiran' | 'Lain-lain'>('Pinjam Barang');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [requesterPhone, setRequesterPhone] = useState(currentUser?.phone || '');
  const [requesterNotes, setRequesterNotes] = useState('');

  // Helper to ensure URI is converted to Base64 data URL
  const ensureBase64 = async (uri: string): Promise<string | undefined> => {
    if (!uri) return undefined;
    if (uri.startsWith('data:image')) return uri;
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(blob);
      });
    } catch {
      return undefined;
    }
  };

  // Success Feedback Modal
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Chat Modal
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState<{ 
    id: string; 
    name: string; 
    username?: string;
    phone?: string;
    distance?: number;
    radiusKm?: number;
  } | null>(null);
  const [activeChatContext, setActiveChatContext] = useState<{ 
    title: string; 
    category?: string;
    distance?: number;
    radiusKm?: number;
  } | null>(null);

  const handleOpenChat = () => {
    if (!selectedRequest) return;
    const requester = allUsers.find((u) => u.id === selectedRequest.requesterId);
    const reqUsername = (
      requester?.username ||
      (selectedRequest.requesterName !== 'Jiran' ? selectedRequest.requesterName : '') ||
      requester?.name ||
      'pemohon'
    ).replace(/^@/, '');

    const recipient = {
      id: selectedRequest.requesterId,
      name: `@${reqUsername}`,
      username: reqUsername,
      phone: selectedRequest.requesterPhone,
      distance: selectedRequest.distance,
      radiusKm: requester?.radiusKm || currentUser?.radiusKm || 5,
    };
    const context = {
      title: selectedRequest.title,
      category: 'Help Nearby',
      distance: selectedRequest.distance,
      radiusKm: requester?.radiusKm || currentUser?.radiusKm || 5,
    };
    setSelectedRequest(null);
    setActiveChatRecipient(recipient);
    setActiveChatContext(context);
    setTimeout(() => {
      setChatModalVisible(true);
    }, 150);
  };

  const filteredRequests = requests.filter((r) => {
    const matchType = r.type === activeTab;
    const matchCat = selectedCategory === 'Semua' || r.category === selectedCategory;
    return matchType && matchCat;
  });

  const handleCreateRequest = async () => {
    if (!currentUser) return;
    if (!title.trim()) {
      alert('Sila masukkan tajuk bantuan.');
      return;
    }

    setIsUploading(true);

    try {
      let base64 = selectedImageBase64;
      if (!base64 && selectedImage && (selectedImage.startsWith('blob:') || selectedImage.startsWith('file:') || selectedImage.startsWith('data:image'))) {
        base64 = await ensureBase64(selectedImage);
      }

      const cleanUsername = (currentUser.username || currentUser.name || 'Jiran').replace(/^@/, '');

      await addRequest({
        title,
        description: description || 'Bantuan komuniti kejiranan.',
        category,
        type: newType,
        distance: 0.4,
        requesterId: currentUser.id,
        requesterName: cleanUsername,
        requesterPhone: requesterPhone.trim() || undefined,
        requesterContactNotes: requesterNotes.trim() || undefined,
        imageUrl: selectedImage || undefined,
        imageBase64: base64,
      });

      setCreateModalVisible(false);
      setTitle('');
      setDescription('');
      setSelectedImage('');
      setSelectedImageBase64(undefined);
      setSuccessTitle('Bantuan Berjaya Disiarkan!');
      setSuccessMsg(`Posting "${title}" anda kini dapat dilihat oleh jiran sekitar ${currentUser.location}.`);
      setSuccessVisible(true);
    } catch (err) {
      alert('Ralat semasa menyiarkan bantuan.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFulfillHelp = (req: HelpRequest) => {
    if (!currentUser) return;
    fulfillRequest(req.id, currentUser.name);
    setSelectedRequest(null);
    setSuccessTitle('Terima Kasih!');
    setSuccessMsg(`Hebat! Anda telah menyatakan persetujuan untuk membantu ${req.requesterName}. Sila hubungi jiran melalui sembang atau WhatsApp untuk penyelarasan.`);
    setSuccessVisible(true);
  };

  const handleOpenWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
    Linking.openURL(`whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(`Salam, saya dari NeighbourLoop mengenai "${selectedRequest?.title}".`)}`).catch(() => {
      Linking.openURL(`https://wa.me/${intlPhone}`);
    });
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-6 bg-purple-600">
        <View className="flex-row items-center justify-center relative">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="absolute left-0 p-2 z-10"
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white text-center">Help Nearby</Text>
        </View>
        <Text className="text-purple-200 text-xs text-center mt-0.5">
          Saling Membantu & Berkongsi Sumber Sesama Jiran
        </Text>
      </View>

      <View className="flex-1 bg-gray-50 px-5 -mt-3 rounded-t-3xl pt-4">
        {/* Permintaan vs Tawaran Tabs */}
        <View className="flex-row bg-gray-200/70 rounded-2xl p-1 mb-3">
          <TouchableOpacity
            className="flex-1 py-2.5 rounded-xl items-center"
            style={activeTab === 'Permintaan' ? { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
            onPress={() => setActiveTab('Permintaan')}
          >
            <Text
              className={`font-bold text-xs ${
                activeTab === 'Permintaan' ? 'text-purple-900' : 'text-gray-500'
              }`}
            >
              🙋‍♂️ Permintaan (Minta Tolong)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-2.5 rounded-xl items-center"
            style={activeTab === 'Tawaran' ? { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
            onPress={() => setActiveTab('Tawaran')}
          >
            <Text
              className={`font-bold text-xs ${
                activeTab === 'Tawaran' ? 'text-purple-900' : 'text-gray-500'
              }`}
            >
              🤝 Tawaran (Sedia Membantu)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          keyboardShouldPersistTaps="always"
          className="mb-3 max-h-9"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={({ pressed }) => ({
                  marginRight: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                  borderRadius: 9999,
                  borderWidth: 1.5,
                  backgroundColor: isSelected ? '#7e22ce' : '#ffffff',
                  borderColor: isSelected ? '#7e22ce' : '#e5e7eb',
                  opacity: pressed ? 0.75 : 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? '#ffffff' : '#4b5563',
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Help Requests Stream */}
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredRequests.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Tag size={40} color="#9ca3af" />
              <Text className="text-gray-400 mt-2 font-semibold">Tiada bantuan dalam kategori ini.</Text>
            </View>
          ) : (
            filteredRequests.map((req) => (
              <TouchableOpacity
                key={req.id}
                onPress={() => setSelectedRequest(req)}
                className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <View className="bg-purple-50 px-2.5 py-0.5 rounded-md self-start border border-purple-100">
                    <Text className="text-[10px] font-bold text-purple-700">{req.category}</Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full ${req.status === 'Open' ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                    <Text className={`text-[10px] font-bold ${req.status === 'Open' ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {req.status === 'Open' ? 'Dibuka' : 'Selesai'}
                    </Text>
                  </View>
                </View>

                {req.imageUrl ? (
                  <Image source={{ uri: req.imageUrl }} className="w-full h-32 rounded-xl mb-2 bg-gray-100 object-cover" />
                ) : null}

                <Text className="text-base font-bold text-gray-900 mb-1">{req.title}</Text>
                <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>
                  {req.description}
                </Text>

                {(() => {
                  const isMyItem = req.requesterId === currentUser.id ||
                    (currentUser.username && req.requesterName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase()) ||
                    (currentUser.name && req.requesterName.toLowerCase() === currentUser.name.toLowerCase());

                  const displayReqName = isMyItem 
                    ? `${req.requesterName} (Anda)` 
                    : req.requesterName;

                  return (
                    <View className="flex-row justify-between items-center pt-2 border-t border-gray-50">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-6 h-6 rounded-full bg-purple-100 items-center justify-center mr-1.5">
                          <User size={12} color="#7e22ce" />
                        </View>
                        <Text className="text-xs text-gray-700 font-semibold" numberOfLines={1}>
                          {displayReqName}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        {isMyItem ? (
                          <View className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <Text className="text-[10px] text-purple-700 font-bold">
                              {req.type === 'Permintaan' ? 'Permintaan Anda' : 'Tawaran Anda'}
                            </Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <MapPin size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-0.5">{req.distance} km</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })()}
              </TouchableOpacity>
            ))
          )}
          <View className="h-24" />
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => {
          setNewType(activeTab);
          setRequesterPhone(currentUser.phone || '');
          setRequesterNotes('');
          setCreateModalVisible(true);
        }}
        className="absolute bottom-6 right-6 bg-purple-700 px-5 py-3.5 rounded-full flex-row items-center shadow-lg shadow-purple-900/40"
      >
        <Plus size={20} color="white" />
        <Text className="text-white font-bold ml-1.5 text-sm">+ Buat {activeTab}</Text>
      </TouchableOpacity>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Modal visible={true} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[88%]">
              <View className="flex-row justify-between items-center mb-3">
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-purple-800 font-bold text-xs">{selectedRequest.category}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                  <X size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedRequest.imageUrl ? (
                  <Image source={{ uri: selectedRequest.imageUrl }} className="w-full h-40 rounded-2xl mb-3 bg-gray-100" />
                ) : null}

                <Text className="text-xl font-bold text-gray-900 mb-2">{selectedRequest.title}</Text>
                <Text className="text-gray-600 text-sm mb-4 leading-5">{selectedRequest.description}</Text>

                {(() => {
                  const isSelectedMyItem = selectedRequest.requesterId === currentUser.id ||
                    (currentUser.username && selectedRequest.requesterName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase()) ||
                    (currentUser.name && selectedRequest.requesterName.toLowerCase() === currentUser.name.toLowerCase());

                  const requesterUser = allUsers.find((u) => u.id === selectedRequest.requesterId);
                  const displayUsername = requesterUser?.username || (selectedRequest.requesterName !== 'Jiran' ? selectedRequest.requesterName.replace(/^@/, '') : 'jiran');

                  return (
                    <>
                      <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-xs text-gray-400 font-semibold uppercase">
                            {selectedRequest.type === 'Permintaan' ? 'Pemohon Bantuan' : 'Pemberi Bantuan'}
                          </Text>
                          {isSelectedMyItem && (
                            <View className="bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                              <Text className="text-[10px] font-bold text-purple-800">Iklan Anda</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm font-bold text-gray-800">
                          @{displayUsername} {isSelectedMyItem ? '(Anda)' : ''}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <MapPin size={14} color="#16a34a" />
                          <Text className="text-xs text-gray-600 ml-1">
                            {isSelectedMyItem
                              ? `Lokasi anda • Radius ${requesterUser?.radiusKm || currentUser?.radiusKm || 5} km`
                              : `${selectedRequest.distance} km dari lokasi anda • Radius ${requesterUser?.radiusKm || currentUser?.radiusKm || 5} km`
                            }
                          </Text>
                        </View>

                        {/* Contact details */}
                        {selectedRequest.requesterPhone ? (
                          <View className="mt-2 pt-2 border-t border-gray-200 flex-row justify-between items-center">
                            <View>
                              <Text className="text-[10px] text-gray-400 uppercase font-semibold">No. WhatsApp</Text>
                              <Text className="text-xs font-bold text-gray-800">{selectedRequest.requesterPhone}</Text>
                            </View>
                            {isSelectedMyItem ? (
                              <View className="bg-purple-100 px-2.5 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-purple-800">Nombor Anda</Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleOpenWhatsApp(selectedRequest.requesterPhone)}
                                className="bg-green-600 px-3 py-1.5 rounded-xl flex-row items-center"
                              >
                                <Phone size={12} color="white" />
                                <Text className="text-white text-xs font-bold ml-1">WhatsApp</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ) : null}
                      </View>

                      {/* Action: You posted this vs Chatbox & Fulfill */}
                      {isSelectedMyItem ? (
                        <>
                          <View className="w-full bg-purple-50 border border-purple-200 py-3.5 px-4 rounded-2xl flex-row justify-between items-center mb-3 shadow-xs">
                            <View className="flex-row items-center flex-1 mr-2">
                              <View className="w-9 h-9 rounded-full bg-purple-700 items-center justify-center mr-3 shadow-xs">
                                <CheckCircle2 size={18} color="white" />
                              </View>
                              <View className="flex-1">
                                <Text className="text-purple-950 font-bold text-sm">
                                  Anda Menyiarkan {selectedRequest.type === 'Permintaan' ? 'Permintaan' : 'Tawaran'} Ini
                                </Text>
                                <Text className="text-purple-700 text-xs mt-0.5">
                                  You posted this • Aktif di komuniti
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                Alert.alert(
                                  'Padam Bantuan',
                                  'Adakah anda pasti ingin memadamkan siaran bantuan ini?',
                                  [
                                    { text: 'Batal', style: 'cancel' },
                                    {
                                      text: 'Padam',
                                      style: 'destructive',
                                      onPress: async () => {
                                        await deleteRequest(selectedRequest.id);
                                        setSelectedRequest(null);
                                      }
                                    }
                                  ]
                                );
                              }}
                              className="bg-red-100/90 px-3 py-2 rounded-xl flex-row items-center active:bg-red-200"
                            >
                              <Trash2 size={14} color="#dc2626" />
                              <Text className="text-xs font-bold text-red-600 ml-1">Padam</Text>
                            </TouchableOpacity>
                          </View>

                          {selectedRequest.status === 'Completed' ? (
                            <View className="py-3 rounded-2xl bg-gray-100 items-center mb-4">
                              <Text className="text-gray-500 font-bold text-xs">
                                Bantuan ini telah diselesaikan oleh {selectedRequest.fulfilledBy || 'anda'}
                              </Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleFulfillHelp(selectedRequest)}
                              className="w-full bg-emerald-600 py-3 rounded-2xl flex-row justify-center items-center mb-4"
                            >
                              <CheckCircle2 size={16} color="white" />
                              <Text className="text-white font-bold text-sm ml-1.5">
                                Tandakan Bantuan Selesai
                              </Text>
                            </TouchableOpacity>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Direct In-App Chat Button */}
                          <TouchableOpacity
                            onPress={handleOpenChat}
                            className="w-full bg-purple-700 py-3.5 rounded-2xl flex-row justify-center items-center shadow-md shadow-purple-900/30 mb-2.5"
                          >
                            <MessageSquare size={18} color="white" />
                            <Text className="text-white font-bold text-base ml-2">
                              Mesej Jiran (Chatbox)
                            </Text>
                          </TouchableOpacity>

                          {selectedRequest.status === 'Completed' ? (
                            <View className="py-3 rounded-2xl bg-gray-100 items-center mb-4">
                              <Text className="text-gray-500 font-bold text-xs">
                                Bantuan ini telah diselesaikan oleh {selectedRequest.fulfilledBy}
                              </Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleFulfillHelp(selectedRequest)}
                              className="w-full bg-emerald-600 py-3 rounded-2xl flex-row justify-center items-center mb-4"
                            >
                              <CheckCircle2 size={16} color="white" />
                              <Text className="text-white font-bold text-sm ml-1.5">
                                Tandakan Bantuan Selesai
                              </Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Create Help Item Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[92%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">+ Buat {newType}</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
                <TouchableOpacity
                  onPress={() => setNewType('Permintaan')}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    newType === 'Permintaan' ? 'bg-purple-700' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-xs font-bold ${newType === 'Permintaan' ? 'text-white' : 'text-gray-600'}`}>
                    Permintaan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewType('Tawaran')}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    newType === 'Tawaran' ? 'bg-purple-700' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-xs font-bold ${newType === 'Tawaran' ? 'text-white' : 'text-gray-600'}`}>
                    Tawaran
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Image Picker for Help Items */}
              <ImagePickerButton
                title="Gambar Barang / Lokasi (Pilihan)"
                selectedImageUri={selectedImage}
                onImageSelected={(uri, base64) => {
                  setSelectedImage(uri);
                  setSelectedImageBase64(base64);
                }}
                presetImages={PRESET_IMAGES}
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Tajuk Bantuan</Text>
              <TextInput
                placeholder={newType === 'Permintaan' ? 'Contoh: Pinjam tangga lipat 1 jam' : 'Contoh: Sedia tumpang beli barang dapur'}
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Kategori</Text>
              <View className="flex-row flex-wrap mb-3">
                {(['Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 mb-2 px-3.5 py-1.5 rounded-full border ${
                      category === cat ? 'bg-purple-700 border-purple-700' : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${category === cat ? 'text-white' : 'text-gray-700'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Penerangan Lanjut</Text>
              <TextInput
                placeholder="Nyatakan bila diperlukan, lokasi atau syarat dengan jelas..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">No. Telefon / WhatsApp (Pilihan)</Text>
              <TextInput
                placeholder="Contoh: 012-3456789"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={requesterPhone}
                onChangeText={setRequesterPhone}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Nota Perhubungan (Pilihan)</Text>
              <TextInput
                placeholder="Contoh: Boleh WhatsApp atau mesej aplikasi."
                placeholderTextColor="#9ca3af"
                value={requesterNotes}
                onChangeText={setRequesterNotes}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-5 text-sm text-gray-900"
              />

              <TouchableOpacity
                onPress={handleCreateRequest}
                disabled={isUploading}
                className={`w-full ${isUploading ? 'bg-purple-400' : 'bg-purple-700'} py-4 rounded-2xl items-center shadow-md shadow-purple-900/30 mb-6 flex-row justify-center`}
              >
                {isUploading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-base ml-2">Menyiarkan Bantuan...</Text>
                  </>
                ) : (
                  <Text className="text-white font-bold text-base">Siarkan Kepada Jiran</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={successVisible}
        title={successTitle}
        message={successMsg}
        onClose={() => setSuccessVisible(false)}
      />

      {/* Chat Modal with Requester */}
      {activeChatRecipient && (
        <ChatModal
          visible={chatModalVisible}
          onClose={() => {
            setChatModalVisible(false);
            setActiveChatRecipient(null);
          }}
          recipient={activeChatRecipient}
          itemContext={activeChatContext || undefined}
        />
      )}
    </SafeAreaView>
  );
}
