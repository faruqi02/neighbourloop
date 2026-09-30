import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Modal, 
  Linking, 
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  X, 
  MapPin, 
  Tag, 
  Phone, 
  MessageSquare, 
  ShoppingBag, 
  SlidersHorizontal,
  CheckCircle2,
  Trash2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMarketStore } from '../../store/useMarketStore';
import { useRecycleStore } from '../../store/useRecycleStore';
import { useUserStore } from '../../store/useUserStore';
import ChatModal from '../../components/ChatModal';

const CATEGORIES = [
  'Semua',
  'Perabot',
  'Elektronik',
  'Pakaian',
  'Barang Percuma',
  'Lain-lain'
];

export default function ExplorerScreen() {
  const router = useRouter();
  const { listings, fetchListings, deleteListing, loading: marketLoading } = useMarketStore();
  const { donations, fetchRecycleData, deleteDonation, loading: recycleLoading } = useRecycleStore();
  const { currentUser, allUsers, fetchUsers } = useUserStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Chat Modal State
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

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  // 16px padding on each side (32px total), 12px gap between the two cards
  const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 32 - 12) / 2);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchListings(),
      fetchRecycleData()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Combine listings & donations into an unified explore feed
  const allItems = useMemo(() => {
    const marketItems = (listings || []).map((l) => ({
      ...l,
      isDonation: false,
      badgeText: l.condition || 'Terpakai',
      displayPrice: `RM ${Number(l.price).toFixed(0)}`,
      sellerPhone: l.sellerPhone,
      sellerContactNotes: l.sellerContactNotes
    }));

    const donationItems = (donations || []).map((d) => ({
      ...d,
      isDonation: true,
      badgeText: 'Percuma',
      displayPrice: 'PERCUMA',
      sellerId: d.donorId,
      sellerName: d.donorName,
      sellerPhone: d.donorPhone,
      sellerContactNotes: d.donorContactNotes,
      distance: d.distance || 1.5
    }));

    return [...marketItems, ...donationItems];
  }, [listings, donations]);

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory === 'Barang Percuma') {
        if (!item.isDonation) return false;
      } else if (selectedCategory !== 'Semua') {
        if (item.category !== selectedCategory) return false;
      }

      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesSeller = item.sellerName?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCategory || matchesSeller;
      }

      return true;
    });
  }, [allItems, selectedCategory, search]);

  const handleOpenWhatsApp = (phone?: string, title?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
    Linking.openURL(
      `whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(`Salam, saya berminat dengan barang "${title || ''}" di NeighbourLoop.`)}`
    ).catch(() => {
      Linking.openURL(`https://wa.me/${intlPhone}`);
    });
  };

  const handleOpenChat = (item: any) => {
    setSelectedItem(null);
    const seller = allUsers.find((u) => u.id === (item.sellerId || item.donorId));
    const sellerUsername = (
      seller?.username ||
      (item.sellerName && item.sellerName !== 'Jiran' ? item.sellerName : '') ||
      (item.donorName && item.donorName !== 'Jiran' ? item.donorName : '') ||
      seller?.name ||
      'penjual'
    ).replace(/^@/, '');

    setActiveChatRecipient({
      id: item.sellerId || item.donorId,
      name: `@${sellerUsername}`,
      username: sellerUsername,
      phone: item.sellerPhone || item.donorPhone,
      distance: item.distance,
      radiusKm: seller?.radiusKm || currentUser?.radiusKm || 5,
    });
    setActiveChatContext({
      title: item.title,
      price: item.isDonation ? 0 : Number(item.price),
      category: item.category,
      distance: item.distance,
      radiusKm: seller?.radiusKm || currentUser?.radiusKm || 5,
    });
    setChatModalVisible(true);
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Top Header with Shopee-style Search Bar */}
      <View className="bg-emerald-600 px-4 pt-2 pb-4 shadow-md shadow-emerald-900/20">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <ShoppingBag size={22} color="white" />
            <Text className="text-xl font-black text-white ml-2 tracking-tight">Explorer</Text>
          </View>
          <View className="flex-row items-center bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <MapPin size={12} color="#a7f3d0" />
            <Text className="text-emerald-100 text-xs font-semibold ml-1" numberOfLines={1}>
              {currentUser.location || 'Kawasan Kejiranan'}
            </Text>
          </View>
        </View>

        {/* Search Bar Input */}
        <View className="flex-row items-center bg-white rounded-2xl px-3.5 py-2.5 shadow-sm">
          <Search size={18} color="#059669" />
          <TextInput
            placeholder="Cari barang, perabot, pakaian, gajet..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2.5 text-sm text-slate-800 font-medium"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} className="p-1">
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : (
            <View className="bg-emerald-50 p-1.5 rounded-lg">
              <SlidersHorizontal size={14} color="#059669" />
            </View>
          )}
        </View>
      </View>

      {/* Horizontal Category Chips */}
      <View className="bg-white border-b border-slate-100 py-2.5">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`mr-2 px-3.5 py-1.5 rounded-full border ${
                  isSelected 
                    ? 'bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-600/30' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content: 2-Column Grid ("Box Box") */}
      <ScrollView
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
        }
      >
        {/* Section Title & Count */}
        <View className="flex-row justify-between items-center mb-2.5 px-1">
          <Text className="text-sm font-black text-slate-800 uppercase tracking-wider">
            {selectedCategory === 'Semua' ? 'Katalog Pilihan Jiran' : selectedCategory}
          </Text>
          <Text className="text-xs font-semibold text-slate-400">
            {filteredItems.length} barang dijumpai
          </Text>
        </View>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <View className="items-center justify-center py-16 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mt-2">
            <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
              <ShoppingBag size={28} color="#94a3b8" />
            </View>
            <Text className="text-slate-800 font-bold text-base text-center">Tiada Barangan Dijumpai</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 max-w-[240px]">
              Cuba ubah carian anda atau pilih kategori lain untuk melihat pilihan komuniti.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                setSelectedCategory('Semua');
              }}
              className="mt-4 bg-emerald-600 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-bold text-xs">Reset Carian</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 2-Column Grid Cards ("Box Box") */
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={`${item.isDonation ? 'don_' : 'mkt_'}${item.id}`}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.88}
                style={{ width: '48.5%' }}
                className="bg-white rounded-2xl mb-3.5 border border-slate-200/80 shadow-sm shadow-slate-100 overflow-hidden"
              >
                {/* Image Container with Badges (Box Box) */}
                <View style={{ width: '100%', aspectRatio: 1 }} className="relative bg-slate-100">
                  <Image
                    source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {/* Top-Right Badge (Condition or Free) */}
                  <View 
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md shadow-sm ${
                      item.isDonation 
                        ? 'bg-purple-600' 
                        : item.badgeText === 'Baru' 
                          ? 'bg-rose-500' 
                          : 'bg-emerald-600'
                    }`}
                  >
                    <Text className="text-[10px] font-black text-white uppercase tracking-tight">
                      {item.badgeText}
                    </Text>
                  </View>

                  {/* Bottom-Left Distance Badge */}
                  <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full flex-row items-center">
                    <MapPin size={9} color="#cbd5e1" />
                    <Text className="text-[10px] text-white font-bold ml-0.5">
                      {item.distance || 1.2} km
                    </Text>
                  </View>
                </View>

                {/* Card Content (Title, Price, Location) */}
                <View className="p-2.5 flex-1 justify-between">
                  {/* Category Pill */}
                  <View className="self-start mb-1">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {item.category || 'Komuniti'}
                    </Text>
                  </View>

                  {/* Title (2 lines max clamp) */}
                  <Text 
                    className="text-xs font-bold text-slate-800 leading-snug mb-1.5 h-8" 
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  {/* Price Tag (Big, bold, Shopee-style) */}
                  <View className="flex-row items-baseline mb-1">
                    <Text 
                      className={`text-base font-black ${
                        item.isDonation ? 'text-purple-600' : 'text-emerald-600'
                      }`}
                    >
                      {item.displayPrice}
                    </Text>
                  </View>

                  {/* Seller & Location footer */}
                  {(() => {
                    const anyItem = item as any;
                    const isMyItem = (anyItem.sellerId && currentUser?.id && anyItem.sellerId === currentUser.id) ||
                      (anyItem.donorId && currentUser?.id && anyItem.donorId === currentUser.id) ||
                      (currentUser?.username && (
                        (anyItem.sellerName && anyItem.sellerName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase()) ||
                        (anyItem.donorName && anyItem.donorName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase())
                      )) ||
                      (currentUser?.name && (
                        (anyItem.sellerName && anyItem.sellerName.toLowerCase() === currentUser.name.toLowerCase()) ||
                        (anyItem.donorName && anyItem.donorName.toLowerCase() === currentUser.name.toLowerCase())
                      ));

                    const displayName = anyItem.sellerName || anyItem.donorName || 'Jiran';

                    return (
                      <View className="flex-row items-center justify-between pt-1 border-t border-slate-100">
                        <Text className="text-[11px] text-slate-500 font-medium flex-1 mr-1" numberOfLines={1}>
                          {isMyItem ? `${displayName} (Anda)` : displayName}
                        </Text>
                        {isMyItem ? (
                          <View className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <Text className="text-[9px] text-emerald-700 font-bold">Iklan Anda</Text>
                          </View>
                        ) : (
                          <View className="bg-slate-100 px-1.5 py-0.5 rounded">
                            <Text className="text-[9px] text-slate-600 font-bold">
                              {item.isDonation ? 'Derma' : 'Jual'}
                            </Text>
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

        <View className="h-16" />
      </ScrollView>

      {/* Item Details Bottom Sheet Modal */}
      {selectedItem && (
        <Modal visible={true} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-3xl p-5 max-h-[88%] shadow-2xl">
              {/* Header Bar */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View 
                    className={`px-2.5 py-0.5 rounded-full mr-2 ${
                      selectedItem.isDonation ? 'bg-purple-100' : 'bg-emerald-100'
                    }`}
                  >
                    <Text 
                      className={`text-[11px] font-black uppercase ${
                        selectedItem.isDonation ? 'text-purple-700' : 'text-emerald-700'
                      }`}
                    >
                      {selectedItem.isDonation ? 'Barang Sumbangan' : 'Marketplace Jiran'}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-400 font-bold">{selectedItem.category}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedItem(null)} 
                  className="p-1.5 bg-slate-100 rounded-full"
                >
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Full Item Image */}
                <Image
                  source={{ uri: selectedItem.imageUrl }}
                  className="w-full h-56 rounded-2xl mb-4 bg-slate-100"
                  resizeMode="cover"
                />

                {/* Price & Condition Row */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text 
                    className={`text-2xl font-black ${
                      selectedItem.isDonation ? 'text-purple-600' : 'text-emerald-600'
                    }`}
                  >
                    {selectedItem.displayPrice}
                  </Text>
                  <View className="bg-slate-100 px-3 py-1 rounded-full">
                    <Text className="text-slate-700 font-bold text-xs">
                      {selectedItem.badgeText}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text className="text-xl font-black text-slate-900 mb-2 leading-tight">
                  {selectedItem.title}
                </Text>

                {/* Description */}
                <Text className="text-slate-600 text-sm mb-4 leading-relaxed">
                  {selectedItem.description || 'Tiada penerangan tambahan diberikan.'}
                </Text>

                {/* Seller & Contact Box */}
                {(() => {
                  const isSelectedMyItem = (selectedItem.sellerId && currentUser?.id && selectedItem.sellerId === currentUser.id) ||
                    (selectedItem.donorId && currentUser?.id && selectedItem.donorId === currentUser.id) ||
                    (currentUser?.username && (
                      (selectedItem.sellerName && selectedItem.sellerName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase()) ||
                      (selectedItem.donorName && selectedItem.donorName.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase())
                    )) ||
                    (currentUser?.name && (
                      (selectedItem.sellerName && selectedItem.sellerName.toLowerCase() === currentUser.name.toLowerCase()) ||
                      (selectedItem.donorName && selectedItem.donorName.toLowerCase() === currentUser.name.toLowerCase())
                    ));

                  const ownerUser = allUsers.find((u) => u.id === (selectedItem.sellerId || selectedItem.donorId));
                  const displayUsername = ownerUser?.username || 
                    (selectedItem.sellerName && selectedItem.sellerName !== 'Jiran' ? selectedItem.sellerName.replace(/^@/, '') : 
                    (selectedItem.donorName && selectedItem.donorName !== 'Jiran' ? selectedItem.donorName.replace(/^@/, '') : 'komuniti'));

                  return (
                    <>
                      <View className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200/80">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-[10px] text-slate-400 font-bold uppercase">
                            {selectedItem.isDonation ? 'Penyumbang' : 'Penjual'}
                          </Text>
                          {isSelectedMyItem && (
                            <View className="bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Text className="text-[10px] font-bold text-emerald-800">Iklan Anda</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm font-bold text-slate-900">
                          @{displayUsername} {isSelectedMyItem ? '(Anda)' : ''}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <MapPin size={13} color="#059669" />
                          <Text className="text-xs text-slate-600 ml-1">
                            {isSelectedMyItem
                              ? `Lokasi jualan anda • Radius ${ownerUser?.radiusKm || currentUser?.radiusKm || 5} km`
                              : `Radius Komuniti: ${ownerUser?.radiusKm || currentUser?.radiusKm || 5} km • ~${selectedItem.distance || 0.5} km dari zon anda`
                            }
                          </Text>
                        </View>

                        {selectedItem.sellerContactNotes ? (
                          <Text className="text-xs text-slate-500 italic mt-2 bg-white p-2.5 rounded-xl border border-slate-100">
                            Nota: "{selectedItem.sellerContactNotes}"
                          </Text>
                        ) : null}

                        {selectedItem.sellerPhone ? (
                          <View className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex-row justify-between items-center">
                            <View>
                              <Text className="text-[10px] text-slate-400 uppercase font-semibold">No. WhatsApp / Telefon</Text>
                              <Text className="text-xs font-bold text-slate-800">{selectedItem.sellerPhone}</Text>
                            </View>
                            {isSelectedMyItem ? (
                              <View className="bg-emerald-100 px-2.5 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-emerald-800">Nombor Anda</Text>
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                      </View>

                      {/* Action: You posted this vs Chatbox & WhatsApp */}
                      {isSelectedMyItem ? (
                        <View className="w-full bg-emerald-50 border border-emerald-200 py-3.5 px-4 rounded-2xl flex-row justify-between items-center mb-6 shadow-xs">
                          <View className="flex-row items-center flex-1 mr-2">
                            <View className="w-9 h-9 rounded-full bg-emerald-600 items-center justify-center mr-3 shadow-xs">
                              <CheckCircle2 size={18} color="white" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-emerald-950 font-bold text-sm">
                                Anda Menyiarkan Iklan Ini
                              </Text>
                              <Text className="text-emerald-700 text-xs mt-0.5">
                                You posted this • Iklan aktif di komuniti
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
                                      if (selectedItem.isDonation) {
                                        await deleteDonation(selectedItem.id);
                                      } else {
                                        await deleteListing(selectedItem.id);
                                      }
                                      setSelectedItem(null);
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
                        <View className="space-y-2.5 mb-6">
                          {/* Chatbox in App Button */}
                          <TouchableOpacity
                            onPress={() => handleOpenChat(selectedItem)}
                            className="w-full bg-emerald-600 py-3.5 rounded-2xl flex-row items-center justify-center shadow-md shadow-emerald-600/30"
                          >
                            <MessageSquare size={18} color="white" />
                            <Text className="text-white font-bold text-sm ml-2">
                              Mesej {selectedItem.isDonation ? 'Penyumbang' : 'Penjual'} (Chatbox)
                            </Text>
                          </TouchableOpacity>

                          {/* WhatsApp Direct Button (if phone exists) */}
                          {selectedItem.sellerPhone ? (
                            <TouchableOpacity
                              onPress={() => handleOpenWhatsApp(selectedItem.sellerPhone, selectedItem.title)}
                              className="w-full bg-green-500 py-3 rounded-2xl flex-row items-center justify-center mt-2"
                            >
                              <Phone size={16} color="white" />
                              <Text className="text-white font-bold text-sm ml-2">
                                WhatsApp ({selectedItem.sellerPhone})
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Interactive Chat Modal with Seller / Donor */}
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
