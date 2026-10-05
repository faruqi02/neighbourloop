import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Pressable,
  Modal,
  Linking,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Search, Plus, MapPin, X, MessageCircle, Phone, Tag, CheckCircle2, ChevronLeft, Trash2 } from 'lucide-react-native';
import { useMarketStore } from '../store/useMarketStore';
import { useUserStore } from '../store/useUserStore';
import { Listing } from '../types';
import SuccessModal from '../components/SuccessModal';
import ImagePickerButton from '../components/ImagePickerButton';
import ChatModal from '../components/ChatModal';

const CATEGORIES = ['Semua', 'Perabot', 'Elektronik', 'Pakaian', 'Lain-lain'];
const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=400',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
];

export default function MarketplaceScreen() {
  const { listings, addListing, deleteListing, fetchListings, loading } = useMarketStore();
  const { currentUser, allUsers, fetchUsers } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    fetchListings();
    fetchUsers?.();
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 40 - 12) / 2);

  // Form State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Perabot' | 'Elektronik' | 'Pakaian' | 'Lain-lain'>('Perabot');
  const [condition, setCondition] = useState<'Baru' | 'Seperti Baru' | 'Terpakai'>('Terpakai');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0]);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '');
  const [sellerContactNotes, setSellerContactNotes] = useState('');

  // Success Feedback
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  // Interactive Chat Modal
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
    price?: number; 
    category?: string;
    distance?: number;
    radiusKm?: number;
  } | null>(null);

  const handleOpenChat = () => {
    if (!selectedListing) return;
    const seller = allUsers.find((u) => u.id === selectedListing.sellerId);
    const sellerUsername = (
      seller?.username ||
      (selectedListing.sellerName !== 'Jiran' ? selectedListing.sellerName : '') ||
      seller?.name ||
      'penjual'
    ).replace(/^@/, '');

    const recipient = {
      id: selectedListing.sellerId,
      name: `@${sellerUsername}`,
      username: sellerUsername,
      phone: selectedListing.sellerPhone,
      distance: selectedListing.distance,
      radiusKm: seller?.radiusKm || currentUser?.radiusKm || 5,
    };
    const context = {
      title: selectedListing.title,
      price: selectedListing.price,
      category: 'Marketplace',
      distance: selectedListing.distance,
      radiusKm: seller?.radiusKm || currentUser?.radiusKm || 5,
    };
    setSelectedListing(null);
    setActiveChatRecipient(recipient);
    setActiveChatContext(context);
    setTimeout(() => {
      setChatModalVisible(true);
    }, 150);
  };

  // Helper to calculate dynamic real-time distance using user GPS and item GPS, ignoring the stored distance column
  const calculateDistance = (item: Listing): number => {
    if (!currentUser) return 0.5;
    if (item.sellerId === currentUser.id) return 0;

    // 1. Direct item lat/lng
    if (currentUser.lat != null && currentUser.lng != null && item.lat != null && item.lng != null) {
      const R = 6371; // km
      const dLat = (item.lat - currentUser.lat) * (Math.PI / 180);
      const dLon = (item.lng - currentUser.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(currentUser.lat * (Math.PI / 180)) * Math.cos(item.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    }

    // 2. Fallback to seller's registered coordinates if item doesn't have lat/lng
    const seller = allUsers.find((u) => u.id === item.sellerId);
    if (currentUser.lat != null && currentUser.lng != null && seller?.lat != null && seller?.lng != null) {
      const R = 6371;
      const dLat = (seller.lat - currentUser.lat) * (Math.PI / 180);
      const dLon = (seller.lng - currentUser.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(currentUser.lat * (Math.PI / 180)) * Math.cos(seller.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    }

    return 0.5;
  };

  const filteredListings = useMemo(() => {
    const list = listings.filter((item) => {
      const isBlocked = (item as any).isBlocked || (item as any).status === 'Disekat';
      if (isBlocked && item.sellerId !== currentUser?.id) {
        return false;
      }
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch = !search || 
        item.title.toLowerCase().includes(search.toLowerCase()) || 
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    // Sort listings from nearest to farthest based on dynamic distance
    return list.sort((a, b) => calculateDistance(a) - calculateDistance(b));
  }, [listings, selectedCategory, search, currentUser, allUsers]);

  const handleCreateListing = async () => {
    if (!currentUser) return;
    if (!title.trim() || !price) {
      alert('Sila masukkan tajuk dan harga barang.');
      return;
    }

    setIsUploading(true);

    try {
      let base64 = selectedImageBase64;
      if (!base64 && selectedImage && (selectedImage.startsWith('blob:') || selectedImage.startsWith('file:') || selectedImage.startsWith('data:image'))) {
        base64 = await ensureBase64(selectedImage);
      }

      const sellerUsername = (currentUser.username || currentUser.name || 'Jiran').replace(/^@/, '');

      await addListing({
        title,
        description: description || 'Barangan preloved berkeadaan elok.',
        price: parseFloat(price) || 0,
        category,
        condition,
        lat: currentUser.lat,
        lng: currentUser.lng,
        distance: 0.5,
        imageUrl: selectedImage || PRESET_IMAGES[0],
        imageBase64: base64,
        sellerId: currentUser.id,
        sellerName: sellerUsername,
        sellerPhone: sellerPhone.trim() || undefined,
        sellerContactNotes: sellerContactNotes.trim() || undefined,
      });

      setCreateModalVisible(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setSelectedImage(PRESET_IMAGES[0]);
      setSelectedImageBase64(undefined);
      setSuccessMsg('Barangan anda berjaya dimuat naik ke ruangan jualan kejiranan.');
      setSuccessVisible(true);
    } catch (err) {
      alert('Ralat semasa memuat naik iklan jualan.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
    Linking.openURL(`whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(`Salam, saya berminat dengan barang "${selectedListing?.title}" di NeighbourLoop.`)}`).catch(() => {
      Linking.openURL(`https://wa.me/${intlPhone}`);
    });
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1.5 -ml-1 bg-gray-100 rounded-full">
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-gray-900">Marketplace</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-3.5 py-2.5 mb-3">
          <Search size={18} color="#9ca3af" />
          <TextInput
            placeholder="Cari barang preloved sekitar anda..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-sm text-gray-800"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
          className="mb-1"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={{
                  marginRight: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  borderRadius: 9999,
                  borderWidth: 1.5,
                  backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                  borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? '#ffffff' : '#4b5563',
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listings Stream */}
      <ScrollView 
        className="px-5 flex-1 pt-3" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && listings.length === 0 ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-400 mt-3 font-semibold">Memuatkan barangan jiran...</Text>
          </View>
        ) : filteredListings.length === 0 ? (
          <View className="items-center justify-center py-16 bg-white rounded-3xl p-6 border border-slate-100">
            <Tag size={40} color="#9ca3af" />
            <Text className="text-gray-400 mt-2 font-semibold">Tiada barang dijumpai.</Text>
            <Text className="text-gray-400 text-xs mt-1 text-center">Jadilah yang pertama menyiarkan barangan jualan di kawasan anda!</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {filteredListings.map((item: Listing) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedListing(item)}
                style={{ width: '48.5%' }}
                activeOpacity={0.88}
                className="bg-white rounded-2xl mb-3.5 border border-slate-200/80 shadow-sm shadow-slate-100 overflow-hidden"
              >
                {/* Image Box */}
                <View style={{ width: '100%', aspectRatio: 1 }} className="relative bg-slate-100">
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {/* Blocked Badge (if viewed by author) */}
                  {((item as any).isBlocked || (item as any).status === 'Disekat') && (
                    <View className="absolute top-2 left-2 bg-rose-600 px-2 py-0.5 rounded-md shadow-sm z-10">
                      <Text className="text-[10px] font-black text-white uppercase tracking-tight">
                        Disekat
                      </Text>
                    </View>
                  )}

                  {/* Top-Right Condition Badge */}
                  <View 
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md shadow-sm ${
                      item.condition === 'Baru' 
                        ? 'bg-rose-500' 
                        : item.condition === 'Seperti Baru' 
                          ? 'bg-blue-600' 
                          : 'bg-emerald-600'
                    }`}
                  >
                    <Text className="text-[10px] font-black text-white uppercase tracking-tight">
                      {item.condition || 'Terpakai'}
                    </Text>
                  </View>

                  {/* Bottom-Left Distance Badge */}
                  <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full flex-row items-center">
                    <MapPin size={9} color="#cbd5e1" />
                    <Text className="text-[10px] text-white font-bold ml-0.5">
                      {calculateDistance(item).toFixed(1)} km
                    </Text>
                  </View>
                </View>

                {/* Details Box */}
                <View className="p-2.5 flex-1 justify-between">
                  <View className="self-start mb-1">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {item.category || 'Barangan'}
                    </Text>
                  </View>

                  {/* Title (2 lines max clamp) */}
                  <Text 
                    className="text-xs font-bold text-slate-800 leading-snug mb-1.5 h-8" 
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  {/* Price Tag (Big, bold) */}
                  <View className="flex-row items-baseline mb-1">
                    <Text className="text-base font-black text-emerald-600">
                      RM {Number(item.price || 0).toFixed(0)}
                    </Text>
                  </View>

                  {/* Seller footer */}
                  {(() => {
                    const isMyItem = item.sellerId === currentUser.id || 
                      (currentUser.username && item.sellerName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase()) ||
                      (currentUser.name && item.sellerName.toLowerCase() === currentUser.name.toLowerCase());

                    return (
                      <View className="flex-row items-center justify-between pt-1 border-t border-slate-100">
                        <Text className="text-[11px] text-slate-500 font-medium flex-1 mr-1" numberOfLines={1}>
                          {isMyItem ? `${item.sellerName} (Anda)` : item.sellerName}
                        </Text>
                        {isMyItem ? (
                          <View className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <Text className="text-[9px] text-emerald-700 font-bold">Iklan Anda</Text>
                          </View>
                        ) : (
                          <View className="bg-blue-50 px-1.5 py-0.5 rounded">
                            <Text className="text-[9px] text-blue-700 font-bold">Jual</Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Button "+ Jual Barang" */}
      <TouchableOpacity
        onPress={() => {
          setSellerPhone(currentUser.phone || '');
          setSellerContactNotes('');
          setCreateModalVisible(true);
        }}
        className="absolute bottom-6 right-6 bg-blue-600 px-5 py-3.5 rounded-full flex-row items-center shadow-lg shadow-blue-600/40"
      >
        <Plus size={20} color="white" />
        <Text className="text-white font-bold ml-1.5 text-sm">+ Jual Barang</Text>
      </TouchableOpacity>

      {/* Item Detail Modal */}
      {selectedListing && (
        <Modal visible={true} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[88%]">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xl font-bold text-gray-900">Maklumat Barang</Text>
                <TouchableOpacity onPress={() => setSelectedListing(null)}>
                  <X size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedListing.imageUrl }}
                  className="w-full h-48 rounded-2xl mb-4 bg-gray-100"
                />

                {/* Blocked Warning Banner */}
                {((selectedListing as any).isBlocked || (selectedListing as any).status === 'Disekat') && (
                  <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4">
                    <Text className="text-xs font-bold text-rose-800">
                      ⚠️ Iklan Ini Disekat oleh Pentadbir
                    </Text>
                    <Text className="text-[11px] text-rose-600 mt-1 leading-4">
                      Iklan jualan ini telah disekat oleh pihak Admin dan tidak dapat dilihat oleh jiran lain di komuniti.
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-2xl font-black text-green-700">
                    RM {Number(selectedListing.price || 0).toFixed(0)}
                  </Text>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 font-bold text-xs">
                      {selectedListing.condition}
                    </Text>
                  </View>
                </View>

                <Text className="text-xl font-bold text-gray-900 mb-2">
                  {selectedListing.title}
                </Text>
                <Text className="text-gray-600 text-sm mb-4 leading-5">
                  {selectedListing.description}
                </Text>

                {/* Seller & Contact Details Box */}
                {(() => {
                  const isSelectedMyItem = selectedListing.sellerId === currentUser.id ||
                    (currentUser.username && selectedListing.sellerName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase()) ||
                    (currentUser.name && selectedListing.sellerName.toLowerCase() === currentUser.name.toLowerCase());

                  const sellerUser = allUsers.find((u) => u.id === selectedListing.sellerId);
                  const displayUsername = sellerUser?.username || (selectedListing.sellerName !== 'Jiran' ? selectedListing.sellerName.replace(/^@/, '') : 'penjual');

                  return (
                    <>
                      <View className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-200">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-xs text-gray-400 font-semibold uppercase">Penjual</Text>
                          {isSelectedMyItem && (
                            <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Text className="text-[10px] font-bold text-emerald-800">Iklan Anda</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm font-bold text-gray-800">
                          @{displayUsername} {isSelectedMyItem ? '(Anda)' : ''}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <MapPin size={14} color="#059669" />
                          <Text className="text-xs text-gray-600 ml-1">
                            {isSelectedMyItem 
                              ? `Lokasi jualan anda • Radius ${sellerUser?.radiusKm || currentUser?.radiusKm || 5} km`
                              : `distance : ${calculateDistance(selectedListing).toFixed(1)} KM`
                            }
                          </Text>
                        </View>

                        {/* Optional Seller Contact Details */}
                        {selectedListing.sellerPhone ? (
                          <View className="mt-2.5 pt-2.5 border-t border-gray-200 flex-row justify-between items-center">
                            <View>
                              <Text className="text-[11px] text-gray-400 uppercase font-semibold">No. WhatsApp / Telefon</Text>
                              <Text className="text-xs font-bold text-gray-800">{selectedListing.sellerPhone}</Text>
                              {selectedListing.sellerContactNotes ? (
                                <Text className="text-[11px] text-gray-500 italic mt-0.5">{selectedListing.sellerContactNotes}</Text>
                              ) : null}
                            </View>
                            {isSelectedMyItem ? (
                              <View className="bg-emerald-100 px-2.5 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-emerald-800">Nombor Anda</Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleOpenWhatsApp(selectedListing.sellerPhone)}
                                className="bg-green-600 px-3 py-1.5 rounded-xl flex-row items-center"
                              >
                                <Phone size={12} color="white" />
                                <Text className="text-white text-xs font-bold ml-1">WhatsApp</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ) : null}
                      </View>

                      {/* Main Action: 'You posted this' vs Chatbox */}
                      {isSelectedMyItem ? (
                        <View className="w-full bg-emerald-50 border border-emerald-200 py-3.5 px-4 rounded-2xl flex-row justify-between items-center mb-3 shadow-xs">
                          <View className="flex-row items-center flex-1 mr-2">
                            <View className="w-9 h-9 rounded-full bg-emerald-600 items-center justify-center mr-3 shadow-xs">
                              <CheckCircle2 size={18} color="white" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-emerald-950 font-bold text-sm">
                                Anda Menyiarkan Iklan Ini
                              </Text>
                              <Text className="text-emerald-700 text-xs mt-0.5">
                                You posted this • Iklan aktif di marketplace
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Padam Iklan',
                                'Adakah anda pasti ingin memadamkan iklan barangan ini?',
                                [
                                  { text: 'Batal', style: 'cancel' },
                                  { 
                                    text: 'Padam', 
                                    style: 'destructive',
                                    onPress: async () => {
                                      await deleteListing(selectedListing.id);
                                      setSelectedListing(null);
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
                      ) : (
                        <TouchableOpacity
                          onPress={handleOpenChat}
                          className="w-full bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-600/30 mb-3"
                        >
                          <MessageCircle size={20} color="white" />
                          <Text className="text-white font-bold text-base ml-2">
                            Mesej Penjual (Chatbox)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Create Listing Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[92%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">+ Muat Naik Barang Jualan</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Picker with Gallery / Camera + Presets */}
              <ImagePickerButton
                title="Pilih / Muat Naik Gambar Barang"
                selectedImageUri={selectedImage}
                onImageSelected={(uri, base64) => {
                  setSelectedImage(uri);
                  setSelectedImageBase64(base64);
                }}
                presetImages={PRESET_IMAGES}
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Nama Barang</Text>
              <TextInput
                placeholder="Contoh: Meja Kayu, Basikal, dsb"
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Harga (RM)</Text>
              <TextInput
                placeholder="Contoh: 35"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900 font-bold"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Kategori</Text>
              <View className="flex-row flex-wrap mb-3">
                {(['Perabot', 'Elektronik', 'Pakaian', 'Lain-lain'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 mb-2 px-3.5 py-1.5 rounded-full border ${
                      category === cat ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${category === cat ? 'text-white' : 'text-gray-700'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Keadaan Barang</Text>
              <View className="flex-row mb-3">
                {(['Seperti Baru', 'Terpakai'] as const).map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    onPress={() => setCondition(cond)}
                    className={`flex-1 mr-2 py-2 rounded-xl border items-center ${
                      condition === cond ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${condition === cond ? 'text-white' : 'text-gray-700'}`}>
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Penerangan</Text>
              <TextInput
                placeholder="Keterangan mengenai keadaan barang, ukuran, dan cara COD..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              {/* Optional Contact Details for this listing */}
              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">No. Telefon / WhatsApp (Pilihan)</Text>
              <TextInput
                placeholder="Contoh: 012-3456789 (Kosongkan jika ingin guna chat sahaja)"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={sellerPhone}
                onChangeText={setSellerPhone}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Nota Perhubungan (Pilihan)</Text>
              <TextInput
                placeholder="Contoh: Boleh WhatsApp atau pick up petang."
                placeholderTextColor="#9ca3af"
                value={sellerContactNotes}
                onChangeText={setSellerContactNotes}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-5 text-sm text-gray-900"
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleCreateListing}
                disabled={isUploading}
                className={`w-full py-4 rounded-2xl items-center shadow-md flex-row justify-center ${
                  isUploading ? 'bg-blue-400' : 'bg-blue-600 shadow-blue-600/30'
                }`}
              >
                {isUploading ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-bold text-base ml-2">Menyimpan & Memuat Naik...</Text>
                  </>
                ) : (
                  <Text className="text-white font-bold text-base">Siarkan Iklan Jualan</Text>
                )}
              </TouchableOpacity>
              <View className="h-6" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Feedback Modal */}
      <SuccessModal
        visible={successVisible}
        title="Iklan Berjaya Diterbitkan!"
        message={successMsg}
        onClose={() => setSuccessVisible(false)}
      />

      {/* Interactive Chat Modal with Seller */}
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
