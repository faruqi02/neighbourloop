import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Pressable,
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
  Trash2,
  ChevronRight
} from 'lucide-react-native';
import { useMarketStore } from '../../store/useMarketStore';
import { useRecycleStore } from '../../store/useRecycleStore';
import { useHelpStore } from '../../store/useHelpStore';
import { useUserStore } from '../../store/useUserStore';
import ChatModal from '../../components/ChatModal';
import LocationModal from '../../components/LocationModal';

const CATEGORIES = [
  'Semua',
  'Marketplace',
  'Help Nearby',
  'Barang Percuma',
  'Perabot',
  'Elektronik',
  'Pakaian',
  'Khidmat/Tenaga',
  'Lain-lain'
];

export default function ExplorerScreen() {
  const { listings, fetchListings, deleteListing, loading: marketLoading } = useMarketStore();
  const { donations, fetchRecycleData, deleteDonation, loading: recycleLoading } = useRecycleStore();
  const { requests: helpRequests, fetchHelpRequests, deleteRequest, loading: helpLoading } = useHelpStore();
  const { currentUser, allUsers, fetchUsers } = useUserStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Location & Radius State (Matched & Synced with currentUser.radiusKm)
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'price_asc' | 'price_desc' | 'newest'>('nearest');
  const [maxDistance, setMaxDistance] = useState<number | null>(currentUser?.radiusKm ?? 5);

  // Sync initial and updated community radius when currentUser.radiusKm changes
  useEffect(() => {
    if (currentUser?.radiusKm !== undefined && currentUser?.radiusKm !== null) {
      setMaxDistance(currentUser.radiusKm);
    }
  }, [currentUser?.radiusKm]);

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
      fetchRecycleData(),
      fetchHelpRequests(),
      fetchUsers?.()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Helper to calculate distance based on user lat/lng or fallback
  const calculateDistance = (itemOwnerId?: string, fallbackDistance?: number): number => {
    if (!itemOwnerId || !currentUser) {
      return fallbackDistance !== undefined && !isNaN(Number(fallbackDistance))
        ? Number(fallbackDistance)
        : 0.5;
    }

    // If current user is the owner, distance is 0 km
    if (itemOwnerId === currentUser.id) return 0;

    const owner = allUsers.find((u) => u.id === itemOwnerId);
    if (currentUser.lat && currentUser.lng && owner?.lat && owner?.lng) {
      const R = 6371; // km
      const dLat = (owner.lat - currentUser.lat) * (Math.PI / 180);
      const dLon = (owner.lng - currentUser.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(currentUser.lat * (Math.PI / 180)) * Math.cos(owner.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return Math.round(d * 10) / 10;
    }

    return fallbackDistance !== undefined && !isNaN(Number(fallbackDistance))
      ? Number(fallbackDistance)
      : 0.5;
  };

  // Combine Marketplace, Recycle & Help Nearby into an unified explore feed, sorted nearest to furthest
  const allItems = useMemo(() => {
    const marketItems = (listings || []).map((l) => {
      const dist = calculateDistance(l.sellerId, l.distance);
      return {
        ...l,
        itemType: 'marketplace' as const,
        isDonation: false,
        isHelp: false,
        badgeText: l.condition || 'Terpakai',
        displayPrice: `RM ${Number(l.price).toFixed(0)}`,
        sellerPhone: l.sellerPhone,
        sellerContactNotes: l.sellerContactNotes,
        distance: dist,
      };
    });

    const donationItems = (donations || []).map((d) => {
      const dist = calculateDistance(d.donorId, d.distance);
      return {
        ...d,
        itemType: 'recycle' as const,
        isDonation: true,
        isHelp: false,
        badgeText: 'Percuma',
        displayPrice: 'PERCUMA',
        sellerId: d.donorId,
        sellerName: d.donorName,
        sellerPhone: d.donorPhone,
        sellerContactNotes: d.donorContactNotes,
        distance: dist,
      };
    });

    const helpItems = (helpRequests || []).map((h) => {
      const dist = calculateDistance(h.requesterId, h.distance);
      const isReq = h.type === 'Permintaan';
      return {
        ...h,
        itemType: 'help' as const,
        isDonation: false,
        isHelp: true,
        badgeText: isReq ? 'Minta Tolong' : 'Sedia Bantu',
        displayPrice: isReq ? 'PERMINTAAN' : 'TAWARAN',
        sellerId: h.requesterId,
        sellerName: h.requesterName,
        sellerPhone: h.requesterPhone,
        sellerContactNotes: h.requesterContactNotes,
        distance: dist,
      };
    });

    const combined = [...marketItems, ...donationItems, ...helpItems];

    // Filter out blocked items unless the current user is the author
    const visibleCombined = combined.filter((item: any) => {
      const isBlocked = item.isBlocked || item.status === 'Disekat';
      if (!isBlocked) return true;
      const ownerId = item.sellerId || item.donorId || item.requesterId;
      return currentUser && ownerId && currentUser.id === ownerId;
    });

    // Sort strictly from nearest with user to the most far
    visibleCombined.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

    return visibleCombined;
  }, [listings, donations, helpRequests, currentUser, allUsers]);

  const userDefaultRadius = currentUser?.radiusKm ?? 5;
  const hasActiveFilters = sortBy !== 'nearest' || (maxDistance !== null && maxDistance !== userDefaultRadius) || selectedCategory !== 'Semua';

  // Filtered and sorted items based on search, category, radius, and sort mode
  const filteredItems = useMemo(() => {
    const list = allItems.filter((item) => {
      // Category / Module filter
      if (selectedCategory === 'Marketplace') {
        if (item.itemType !== 'marketplace') return false;
      } else if (selectedCategory === 'Help Nearby') {
        if (!item.isHelp && item.itemType !== 'help') return false;
      } else if (selectedCategory === 'Barang Percuma') {
        if (!item.isDonation && item.itemType !== 'recycle') return false;
      } else if (selectedCategory !== 'Semua') {
        const itemCat = String(item.category || '').toLowerCase().trim();
        const selCat = selectedCategory.toLowerCase().trim();
        const matches = 
          itemCat === selCat || 
          itemCat.includes(selCat) || 
          selCat.includes(itemCat) ||
          (selCat === 'perabot' && itemCat.includes('perabot')) ||
          (selCat === 'elektronik' && (itemCat.includes('elektronik') || itemCat.includes('e-waste'))) ||
          (selCat === 'pakaian' && (itemCat.includes('pakaian') || itemCat.includes('tekstil'))) ||
          (selCat === 'khidmat/tenaga' && (itemCat.includes('khidmat') || itemCat.includes('tenaga') || itemCat.includes('kemahiran')));
        if (!matches) return false;
      }

      // Max Distance filter
      if (maxDistance !== null && (item.distance ?? 999) > maxDistance) {
        return false;
      }

      // Search query filter (bulletproof safe string matching)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const titleStr = String(item.title || '').toLowerCase();
        const descStr = String(item.description || '').toLowerCase();
        const catStr = String(item.category || '').toLowerCase();
        const sellerStr = String((item as any).sellerName || (item as any).donorName || '').toLowerCase();
        if (!titleStr.includes(q) && !descStr.includes(q) && !catStr.includes(q) && !sellerStr.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    const sorted = [...list];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => (Number((a as any).price) || 0) - (Number((b as any).price) || 0));
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => (Number((b as any).price) || 0) - (Number((a as any).price) || 0));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    } else {
      // Default: nearest distance
      sorted.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    }

    return sorted;
  }, [allItems, selectedCategory, maxDistance, search, sortBy]);

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
      <View style={{ backgroundColor: '#059669', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShoppingBag size={22} color="white" />
            <Text style={{ fontSize: 20, fontWeight: '900', color: 'white', marginLeft: 8 }}>Explorer</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#047857',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: '#6ee7b7',
            }}
          >
            <MapPin size={12} color="#a7f3d0" />
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginLeft: 6, maxWidth: 130 }} numberOfLines={1}>
              {currentUser.location || 'Kawasan Kejiranan'}
            </Text>
            <Text style={{ color: '#a7f3d0', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>
              ({maxDistance !== null ? `${maxDistance}km` : 'Semua'})
            </Text>
            <ChevronRight size={12} color="#a7f3d0" />
          </TouchableOpacity>
        </View>

        {/* Search Bar Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#059669" />
          <TextInput
            placeholder="Cari barang, perabot, pakaian, gajet..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b', fontWeight: '500', paddingVertical: 0 }}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 4, marginRight: 6 }}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}

          {/* Interactive Filter & Sort Button */}
          <TouchableOpacity 
            onPress={() => setFilterModalVisible(true)} 
            activeOpacity={0.7}
            style={{
              padding: 6,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: hasActiveFilters ? '#059669' : '#ecfdf5',
            }}
          >
            <SlidersHorizontal size={14} color={hasActiveFilters ? '#ffffff' : '#059669'} />
            {hasActiveFilters && (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fbbf24', marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Category Chips */}
      <View className="bg-white border-b border-slate-100 py-2.5">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}
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
                  paddingHorizontal: 15,
                  paddingVertical: 7,
                  borderRadius: 9999,
                  borderWidth: 1.5,
                  backgroundColor: isSelected ? '#059669' : '#f8fafc',
                  borderColor: isSelected ? '#059669' : '#e2e8f0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#ffffff' : '#475569',
                  }}
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
        keyboardShouldPersistTaps="handled"
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

        {/* Empty State ("Item Not Found") */}
        {filteredItems.length === 0 ? (
          <View 
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 44,
              paddingHorizontal: 24,
              backgroundColor: '#ffffff',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#f1f5f9',
              marginTop: 12,
            }}
          >
            <View 
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#f1f5f9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Search size={28} color="#94a3b8" />
            </View>
            <Text style={{ color: '#1e293b', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
              Item Tidak Dijumpai
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 4, maxWidth: 260 }}>
              {search.trim() 
                ? `Tiada sebarang hasil padanan untuk "${search.trim()}".` 
                : 'Tiada barangan dalam pilihan kategori atau had jarak semasa.'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                setSelectedCategory('Semua');
                if (currentUser?.radiusKm) setMaxDistance(currentUser.radiusKm);
              }}
              style={{
                marginTop: 16,
                backgroundColor: '#059669',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>Reset Carian</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 2-Column Grid Cards ("Box Box") */
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {filteredItems.map((item: any, index: number) => (
              <TouchableOpacity
                key={`card_${item.itemType || (item.isDonation ? 'don' : 'mkt')}_${item.id || index}`}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.88}
                style={{
                  width: '48.5%',
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  overflow: 'hidden',
                }}
              >
                {/* Image Container with Badges (Box Box) */}
                <View style={{ width: '100%', aspectRatio: 1, position: 'relative', backgroundColor: '#f1f5f9' }}>
                  <Image
                    source={{ 
                      uri: item.imageUrl || (
                        item.isHelp 
                          ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400' 
                          : item.isDonation
                            ? 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400'
                            : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
                      ) 
                    }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {/* Blocked Badge (if viewed by author) */}
                  {(item.isBlocked || item.status === 'Disekat') && (
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#dc2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 10 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase' }}>
                        Disekat
                      </Text>
                    </View>
                  )}

                  {/* Top-Right Badge (Condition or Free or Help) */}
                  <View 
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: item.isHelp
                        ? '#6b21a8'
                        : item.isDonation 
                          ? '#9333ea' 
                          : item.badgeText === 'Baru' 
                            ? '#f43f5e' 
                            : '#059669',
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase' }}>
                      {item.badgeText}
                    </Text>
                  </View>

                  {/* Bottom-Left Distance Badge */}
                  <View 
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 9999,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <MapPin size={9} color="#cbd5e1" />
                    <Text style={{ fontSize: 10, color: '#ffffff', fontWeight: 'bold', marginLeft: 2 }}>
                      {Number(item.distance || 0).toFixed(1)} km
                    </Text>
                  </View>
                </View>

                {/* Card Content (Title, Price, Location) */}
                <View style={{ padding: 10, flex: 1, justifyContent: 'space-between' }}>
                  {/* Category Pill */}
                  <View style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>
                      {item.category || (item.isHelp ? 'Bantuan' : 'Komuniti')}
                    </Text>
                  </View>

                  {/* Title (2 lines max clamp) */}
                  <Text 
                    style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b', lineHeight: 16, marginBottom: 6, height: 32 }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  {/* Price Tag (Big, bold, Shopee-style) */}
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                    <Text 
                      style={{
                        fontSize: 16,
                        fontWeight: '900',
                        color: item.isHelp ? '#6b21a8' : item.isDonation ? '#9333ea' : '#059669',
                      }}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500', flex: 1, marginRight: 4 }} numberOfLines={1}>
                          {isMyItem ? `${displayName} (Anda)` : displayName}
                        </Text>
                        {isMyItem ? (
                          <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#a7f3d0' }}>
                            <Text style={{ fontSize: 9, color: '#047857', fontWeight: 'bold' }}>Iklan Anda</Text>
                          </View>
                        ) : (
                          <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ fontSize: 9, color: '#475569', fontWeight: 'bold' }}>
                              {item.isHelp ? (anyItem.type === 'Permintaan' ? 'Minta Tolong' : 'Sedia Bantu') : (item.isDonation ? 'Derma' : 'Jual')}
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
                      selectedItem.isHelp || selectedItem.isDonation ? 'bg-purple-100' : 'bg-emerald-100'
                    }`}
                  >
                    <Text 
                      className={`text-[11px] font-black uppercase ${
                        selectedItem.isHelp 
                          ? 'text-purple-800' 
                          : selectedItem.isDonation 
                            ? 'text-purple-700' 
                            : 'text-emerald-700'
                      }`}
                    >
                      {selectedItem.isHelp 
                        ? (selectedItem.type === 'Permintaan' ? 'Permintaan Bantuan' : 'Tawaran Bantuan')
                        : (selectedItem.isDonation ? 'Barang Sumbangan' : 'Marketplace')}
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
                  source={{ 
                    uri: selectedItem.imageUrl || (
                      selectedItem.isHelp 
                        ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400' 
                        : selectedItem.isDonation
                          ? 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400'
                          : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
                    ) 
                  }}
                  className="w-full h-56 rounded-2xl mb-4 bg-slate-100"
                  resizeMode="cover"
                />

                {/* Blocked Warning Banner */}
                {(selectedItem.isBlocked || selectedItem.status === 'Disekat') && (
                  <View className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4">
                    <Text className="text-xs font-bold text-rose-800">
                      ⚠️ Hantaran Ini Disekat oleh Pentadbir
                    </Text>
                    <Text className="text-[11px] text-rose-600 mt-1 leading-4">
                      Hantaran ini tidak dipaparkan kepada pengguna umum NeighbourLoop kerana telah disekat oleh pihak Admin.
                    </Text>
                  </View>
                )}

                {/* Price & Condition Row */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text 
                    className={`text-2xl font-black ${
                      selectedItem.isHelp 
                        ? 'text-purple-700' 
                        : selectedItem.isDonation 
                          ? 'text-purple-600' 
                          : 'text-emerald-600'
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

                  const ownerRoleTitle = selectedItem.isHelp 
                    ? (selectedItem.type === 'Permintaan' ? 'Pemohon Bantuan' : 'Pemberi Bantuan')
                    : (selectedItem.isDonation ? 'Penyumbang' : 'Penjual');

                  return (
                    <>
                      <View className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200/80">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-[10px] text-slate-400 font-bold uppercase">
                            {ownerRoleTitle}
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
                              ? `Lokasi anda • Radius ${ownerUser?.radiusKm || currentUser?.radiusKm || 5} km`
                              : `Radius Komuniti: ${ownerUser?.radiusKm || currentUser?.radiusKm || 5} km • ~${Number(selectedItem.distance || 0).toFixed(1)} km dari zon anda`
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
                                Anda Menyiarkan {selectedItem.isHelp ? 'Bantuan' : 'Iklan'} Ini
                              </Text>
                              <Text className="text-emerald-700 text-xs mt-0.5">
                                You posted this • Aktif di komuniti
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Padam Siaran',
                                'Adakah anda pasti ingin memadamkan siaran ini?',
                                [
                                  { text: 'Batal', style: 'cancel' },
                                  {
                                    text: 'Padam',
                                    style: 'destructive',
                                    onPress: async () => {
                                      if (selectedItem.isHelp) {
                                        await deleteRequest(selectedItem.id);
                                      } else if (selectedItem.isDonation) {
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
                            className={`w-full ${selectedItem.isHelp ? 'bg-purple-700' : 'bg-emerald-600'} py-3.5 rounded-2xl flex-row items-center justify-center shadow-md`}
                          >
                            <MessageSquare size={18} color="white" />
                            <Text className="text-white font-bold text-sm ml-2">
                              Mesej {selectedItem.isHelp ? (selectedItem.type === 'Permintaan' ? 'Pemohon' : 'Pemberi') : (selectedItem.isDonation ? 'Penyumbang' : 'Penjual')} (Chatbox)
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

      {/* Filter & Sort Bottom Sheet Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%] shadow-2xl">
            {/* Header */}
            <View className="flex-row justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <View className="flex-row items-center">
                <SlidersHorizontal size={18} color="#059669" />
                <Text className="text-lg font-black text-slate-900 ml-2">Penapis & Susunan</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)} 
                className="p-1.5 bg-slate-100 rounded-full"
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Susun Mengikut (Sort By) */}
              <Text className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Susun Mengikut
              </Text>
              <View className="flex-row flex-wrap mb-4">
                {[
                  { id: 'nearest', label: '📍 Paling Dekat' },
                  { id: 'price_asc', label: '💵 Harga: Rendah ke Tinggi' },
                  { id: 'price_desc', label: '💰 Harga: Tinggi ke Rendah' },
                  { id: 'newest', label: '⏱️ Terbaharu' }
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSortBy(s.id as any)}
                    className={`mr-2 mb-2 px-3.5 py-2 rounded-xl border ${
                      sortBy === s.id 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${sortBy === s.id ? 'text-white' : 'text-slate-700'}`}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Had Jarak (Max Distance) */}
              <Text className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Had Jarak Komuniti
              </Text>
              <View className="flex-row flex-wrap mb-4">
                {[
                  { val: null, label: 'Semua Jarak' },
                  { val: 2, label: '≤ 2 km' },
                  { val: 5, label: '≤ 5 km' },
                  { val: 10, label: '≤ 10 km' },
                  { val: 20, label: '≤ 20 km' }
                ].map((d) => (
                  <TouchableOpacity
                    key={String(d.val)}
                    onPress={() => setMaxDistance(d.val)}
                    className={`mr-2 mb-2 px-3.5 py-2 rounded-xl border ${
                      maxDistance === d.val 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${maxDistance === d.val ? 'text-white' : 'text-slate-700'}`}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Modul Pilihan */}
              <Text className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Kategori / Jenis Modul
              </Text>
              <View className="flex-row flex-wrap mb-5">
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedCategory(c)}
                    className={`mr-2 mb-2 px-3 py-1.5 rounded-xl border ${
                      selectedCategory === c 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${selectedCategory === c ? 'text-white' : 'text-slate-700'}`}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="flex-row items-center pt-3 border-t border-slate-100 gap-3">
              <TouchableOpacity
                onPress={() => {
                  setSortBy('nearest');
                  setMaxDistance(currentUser?.radiusKm ?? 5);
                  setSelectedCategory('Semua');
                  setSearch('');
                }}
                className="py-3.5 px-4 rounded-2xl bg-slate-100 items-center justify-center"
              >
                <Text className="text-slate-700 font-bold text-xs">Reset Semua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 items-center justify-center shadow-md shadow-emerald-900/20"
              >
                <Text className="text-white font-bold text-sm">
                  Guna Penapis ({filteredItems.length} barang)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location & Radius Settings Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </SafeAreaView>
  );
}
