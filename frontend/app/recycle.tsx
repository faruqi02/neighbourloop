import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  Phone, 
  Clock, 
  Heart, 
  Gift, 
  Plus, 
  X, 
  MessageCircle, 
  CheckCircle2 
} from 'lucide-react-native';
import { useRecycleStore } from '../store/useRecycleStore';
import { useUserStore } from '../store/useUserStore';
import { SmartRecommendation, RecycleCenter, DonationItem } from '../types';
import SuccessModal from '../components/SuccessModal';
import ImagePickerButton from '../components/ImagePickerButton';
import ChatModal from '../components/ChatModal';
import LeafletSatelliteMap from '../components/LeafletSatelliteMap';

const recycleIcon = require('../images/recycle_icon.png');

const RECYCLE_CATEGORIES = [
  'Pakaian & Tekstil',
  'E-waste & Elektronik',
  'Kertas & Buku',
  'Plastik',
  'Kaca',
  'Logam & Besi',
  'Perabot & Rumah',
];

const PRESET_ITEMS = [
  { name: 'Baju Lama', cat: 'Pakaian & Tekstil', cond: 'Masih elok' as const },
  { name: 'Telefon Pintar Rosak', cat: 'E-waste & Elektronik', cond: 'Rosak / Tidak Berfungsi' as const },
  { name: 'Buku Rujukan', cat: 'Kertas & Buku', cond: 'Masih elok' as const },
  { name: 'Kabel Komputer Lama', cat: 'E-waste & Elektronik', cond: 'Rosak / Tidak Berfungsi' as const },
  { name: 'Botol Plastik 1.5L', cat: 'Plastik', cond: 'Rosak / Tidak Berfungsi' as const },
];

export default function RecycleScreen() {
  const { centers, donations, addDonation, claimDonation, getSmartRecommendation, fetchRecycleData, loading } = useRecycleStore();
  const { currentUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    fetchRecycleData();
  }, [currentUser?.location, currentUser?.lat, currentUser?.lng, currentUser?.radiusKm]);

  const [activeSubTab, setActiveSubTab] = useState<'SmartEngine' | 'Directory' | 'ClaimFeed'>('SmartEngine');

  // Smart Engine Form State
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(RECYCLE_CATEGORIES[0]);
  const [condition, setCondition] = useState<'Masih elok' | 'Rosak / Tidak Berfungsi'>('Masih elok');
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);

  // Center Filter State
  const [centerTypeFilter, setCenterTypeFilter] = useState<'Semua' | 'RecycleCenter' | 'NGO'>('Semua');

  // Center Details Modal
  const [selectedCenter, setSelectedCenter] = useState<RecycleCenter | null>(null);

  // Donate Form Modal (New feature requested)
  const [donateModalVisible, setDonateModalVisible] = useState(false);
  const [donationTitle, setDonationTitle] = useState('');
  const [donationDesc, setDonationDesc] = useState('');
  const [donationCat, setDonationCat] = useState(RECYCLE_CATEGORIES[0]);
  const [donationImage, setDonationImage] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
  const [donationImageBase64, setDonationImageBase64] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [donorPhone, setDonorPhone] = useState(currentUser?.phone || '');
  const [donorNotes, setDonorNotes] = useState('');

  // Helper to ensure image uri is converted to base64 if needed
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

  // Chat with Donor Modal
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; phone?: string; title: string }>({
    id: '',
    name: '',
    title: '',
  });

  const handleAnalyze = () => {
    if (!itemName.trim()) {
      alert('Sila masukkan nama barangan terlebih dahulu.');
      return;
    }
    const result = getSmartRecommendation(itemName, category, condition);
    setRecommendation(result);
  };

  const handleDropoffAction = (centerName: string) => {
    setSuccessTitle('Penghantaran Direkodkan!');
    setSuccessMsg(`Terima kasih kerana menghantar barangan ke ${centerName}. Tindakan anda membantu kelestarian komuniti setempat.`);
    setSuccessVisible(true);
    setRecommendation(null);
    setItemName('');
  };

  const handleClaim = (donation: DonationItem) => {
    if (!currentUser) return;
    claimDonation(donation.id, currentUser.name);
    setSuccessTitle('Tuntutan Berjaya!');
    setSuccessMsg(`Anda telah menuntut "${donation.title}". Sila hubungi penderma (${donation.donorName}) untuk tetapkan masa pengambilan.`);
    setSuccessVisible(true);
  };

  const handleCreateDonation = async () => {
    if (!currentUser) return;
    if (!donationTitle.trim()) {
      alert('Sila masukkan tajuk barangan derma.');
      return;
    }

    setIsUploading(true);

    try {
      let base64 = donationImageBase64;
      if (!base64 && donationImage && (donationImage.startsWith('blob:') || donationImage.startsWith('file:') || donationImage.startsWith('data:image'))) {
        base64 = await ensureBase64(donationImage);
      }

      const donorName = (currentUser.username || currentUser.name || 'Penderma').replace(/^@/, '');

      const success = await addDonation({
        title: donationTitle,
        description: donationDesc || 'Barangan elok disumbangkan untuk jiran yang memerlukan.',
        category: donationCat,
        imageUrl: donationImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
        imageBase64: base64,
        donorId: currentUser.id,
        donorName: donorName,
        donorPhone: donorPhone.trim() || undefined,
        donorContactNotes: donorNotes.trim() || undefined,
        distance: 0.5,
      });

      if (success !== false) {
        setDonateModalVisible(false);
        setDonationTitle('');
        setDonationDesc('');
        setDonationImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
        setDonationImageBase64(undefined);
        setSuccessTitle('Barang Derma Diterbitkan!');
        setSuccessMsg('Barangan anda kini sedia untuk dituntut oleh jiran sekitar secara percuma.');
        setSuccessVisible(true);
      } else {
        alert('Gagal menyiarkan barang derma ke pangkalan data.');
      }
    } catch (e) {
      alert('Ralat ketika memproses muat naik gambar derma.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCallCenter = (phone?: string) => {
    if (!phone) {
      alert('Tiada nombor telefon disediakan untuk pusat ini.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const filteredCenters = centers
    .filter((c) => {
      if (centerTypeFilter === 'Semua') return true;
      return c.type === centerTypeFilter;
    })
    .sort((a, b) => (Number(a.distance) || 0) - (Number(b.distance) || 0));

  if (!currentUser) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Custom Recycle Icon */}
      <View className="px-5 pt-3 pb-3 bg-green-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1.5 -ml-1 bg-green-800/50 rounded-full">
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-black text-white" numberOfLines={1} adjustsFontSizeToFit>Donate & Recycle</Text>
              <Text className="text-green-100 text-[10px] mt-0.5" numberOfLines={2}>
                Sistem Cadangan Pintar & Kitar Semula
              </Text>
            </View>
          </View>
          <Image source={recycleIcon} className="w-12 h-12" style={{ width: 48, height: 48 }} resizeMode="contain" />
        </View>
      </View>

      {/* Subtabs Header */}
      <View className="flex-row bg-gray-100 p-1.5 mx-5 mt-3 rounded-2xl">
        <TouchableOpacity
          onPress={() => setActiveSubTab('SmartEngine')}
          className="flex-1 py-2 rounded-xl items-center"
          style={activeSubTab === 'SmartEngine' ? { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
        >
          <Text
            className={`text-xs font-bold ${
              activeSubTab === 'SmartEngine' ? 'text-green-800' : 'text-gray-500'
            }`}
          >
            Cadangan Pintar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSubTab('Directory')}
          className="flex-1 py-2 rounded-xl items-center"
          style={activeSubTab === 'Directory' ? { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
        >
          <Text
            className={`text-xs font-bold ${
              activeSubTab === 'Directory' ? 'text-green-800' : 'text-gray-500'
            }`}
          >
            Pusat & NGO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSubTab('ClaimFeed')}
          className="flex-1 py-2 rounded-xl items-center"
          style={activeSubTab === 'ClaimFeed' ? { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
        >
          <Text
            className={`text-xs font-bold ${
              activeSubTab === 'ClaimFeed' ? 'text-green-800' : 'text-gray-500'
            }`}
          >
            Derma Komuniti
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: Smart Recommendation Engine */}
      {activeSubTab === 'SmartEngine' && (
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-base font-bold text-gray-900 mb-1">
            Sistem Cadangan Pintar Barangan Terpakai
          </Text>
          <Text className="text-gray-500 text-xs mb-3">
            Sistem menganalisis barangan anda sama ada lebih sesuai untuk didermakan, dijual semula, atau dihantar ke pusat kitar semula berdaftar.
          </Text>

          {/* Quick Preset Pills */}
          <Text className="text-[11px] font-bold text-gray-400 uppercase mb-1.5">
            Contoh Pantas:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {PRESET_ITEMS.map((p, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setItemName(p.name);
                  setCategory(p.cat);
                  setCondition(p.cond);
                  setRecommendation(null);
                }}
                className="mr-2 bg-gray-100 px-3 py-1 rounded-full border border-gray-200"
              >
                <Text className="text-xs text-gray-700 font-medium">{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Item Name Input */}
          <Text className="text-xs font-bold text-gray-600 mb-1 uppercase">Nama Barangan</Text>
          <TextInput
            placeholder="Contoh: Pakaian terpakai, Komputer rosak..."
            placeholderTextColor="#9ca3af"
            value={itemName}
            onChangeText={setItemName}
            className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
          />

          {/* Category Picker */}
          <Text className="text-xs font-bold text-gray-600 mb-1 uppercase">Kategori Barangan</Text>
          <View className="flex-row flex-wrap mb-3">
            {RECYCLE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${
                  category === cat ? 'bg-green-700 border-green-700' : 'bg-gray-100 border-transparent'
                }`}
              >
                <Text className={`text-xs font-semibold ${category === cat ? 'text-white' : 'text-gray-700'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Condition Picker */}
          <Text className="text-xs font-bold text-gray-600 mb-1 uppercase">Keadaan Barangan</Text>
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={() => setCondition('Masih elok')}
              className={`flex-1 mr-2 p-3 rounded-2xl border items-center ${
                condition === 'Masih elok'
                  ? 'bg-green-50 border-green-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Text className={`font-bold text-xs ${condition === 'Masih elok' ? 'text-green-800' : 'text-gray-600'}`}>
                ✅ Masih Elok
              </Text>
              <Text className="text-[10px] text-gray-500 mt-0.5">Boleh diguna semula</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCondition('Rosak / Tidak Berfungsi')}
              className={`flex-1 ml-2 p-3 rounded-2xl border items-center ${
                condition === 'Rosak / Tidak Berfungsi'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Text className={`font-bold text-xs ${condition === 'Rosak / Tidak Berfungsi' ? 'text-red-800' : 'text-gray-600'}`}>
                ❌ Rosak / Pecah
              </Text>
              <Text className="text-[10px] text-gray-500 mt-0.5">Tidak boleh dipakai</Text>
            </TouchableOpacity>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            onPress={handleAnalyze}
            className="w-full bg-green-700 py-3.5 rounded-2xl flex-row justify-center items-center shadow-md shadow-green-800/30 mb-6"
          >
            <Sparkles size={18} color="white" />
            <Text className="text-white font-bold text-sm ml-2">
              Dapatkan Cadangan Pintar (Analisis)
            </Text>
          </TouchableOpacity>

          {/* Recommendation Output Card */}
          {recommendation && (
            <View className="bg-white rounded-3xl p-5 mb-8 border border-green-200 shadow-md shadow-green-900/10">
              <View className="flex-row items-center mb-2">
                <View className={`w-9 h-9 rounded-full ${recommendation.decision === 'Derma' ? 'bg-purple-100' : 'bg-emerald-100'} items-center justify-center mr-2.5`}>
                  {recommendation.decision === 'Derma' ? (
                    <Heart size={20} color="#9333ea" />
                  ) : (
                    <Image source={recycleIcon} className="w-6 h-6" resizeMode="contain" />
                  )}
                </View>
                <Text className="text-base font-bold text-gray-900 flex-1">
                  {recommendation.title}
                </Text>
              </View>

              <Text className="text-gray-600 text-xs leading-5 mb-4">
                {recommendation.explanation}
              </Text>

              <Text className="text-xs font-bold text-gray-800 uppercase mb-2">
                Pusat / NGO Padanan Terdekat:
              </Text>

              {recommendation.matchingCenters.slice(0, 2).map((c) => (
                <View key={c.id} className="bg-gray-50 p-3.5 rounded-2xl mb-2.5 border border-gray-200">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-sm font-bold text-gray-900 flex-1 mr-2">{c.name}</Text>
                    <Text className="text-xs text-green-700 font-bold">{c.distance} km</Text>
                  </View>
                  <Text className="text-gray-500 text-xs mt-1">{c.address}</Text>
                  <Text className="text-gray-600 text-[11px] mt-0.5 font-medium">Waktu: {c.operatingHours}</Text>

                  <View className="flex-row mt-3 space-x-2">
                    <TouchableOpacity
                      onPress={() => handleCallCenter(c.contactPhone)}
                      className="flex-1 bg-white border border-gray-300 py-2.5 rounded-xl items-center flex-row justify-center mr-2"
                    >
                      <Phone size={14} color="#16a34a" />
                      <Text className="text-gray-800 font-bold text-xs ml-1">Telefon</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDropoffAction(c.name)}
                      className="flex-1 bg-green-700 py-2.5 rounded-xl items-center justify-center"
                    >
                      <Text className="text-white font-bold text-xs">Selesai Hantar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="h-10" />
        </ScrollView>
      )}

      {/* TAB 2: Centers & NGO Directory */}
      {activeSubTab === 'Directory' && (
        <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
          {/* Filter Pills */}
          <View className="flex-row mb-3">
            {(['Semua', 'RecycleCenter', 'NGO'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setCenterTypeFilter(t)}
                className={`mr-2 px-4 py-1.5 rounded-full border ${
                  centerTypeFilter === t
                    ? 'bg-green-700 border-green-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    centerTypeFilter === t ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {t === 'Semua' ? 'Semua Pusat' : t === 'RecycleCenter' ? 'Pusat Kitar Semula' : 'Pusat Derma NGO'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Real Interactive Satellite Map (Leaflet & Esri Satellite) */}
          <LeafletSatelliteMap
            userLat={currentUser.lat || 3.1517}
            userLng={currentUser.lng || 101.5947}
            userLocationName={currentUser.location}
            radiusKm={currentUser.radiusKm || 5}
            centers={filteredCenters}
            onSelectCenter={(c) => setSelectedCenter(c)}
            height={220}
          />

          {/* Centers List */}
          {filteredCenters.map((center) => (
            <TouchableOpacity
              key={center.id}
              onPress={() => setSelectedCenter(center)}
              className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-1 mr-2">
                <View className="flex-row items-center mb-1">
                  <View className={`px-2 py-0.5 rounded-md mr-2 ${center.type === 'NGO' ? 'bg-purple-100' : 'bg-green-100'}`}>
                    <Text className={`text-[10px] font-bold ${center.type === 'NGO' ? 'text-purple-800' : 'text-green-800'}`}>
                      {center.type === 'NGO' ? 'Pusat Derma NGO' : 'Pusat Kitar Semula'}
                    </Text>
                  </View>
                  <Text className="text-xs font-bold text-gray-500">{center.distance} km</Text>
                </View>

                <Text className="text-sm font-bold text-gray-900">{center.name}</Text>
                <Text className="text-gray-500 text-xs mt-0.5">{center.address}</Text>
                <Text className="text-gray-600 text-[11px] mt-1 font-medium">Buka: {center.operatingHours}</Text>
              </View>

              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}

          <View className="h-16" />
        </ScrollView>
      )}

      {/* TAB 3: Community Donations Claim Feed */}
      {activeSubTab === 'ClaimFeed' && (
        <View className="flex-1">
          <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
            <View className="bg-purple-50 p-4 rounded-2xl mb-4 border border-purple-100">
              <View className="flex-row items-center mb-1">
                <Gift size={18} color="#9333ea" />
                <Text className="text-purple-900 font-bold text-sm ml-1.5">Barang Percuma Komuniti (Free Claim)</Text>
              </View>
              <Text className="text-purple-700 text-xs leading-4">
                Barangan elok yang disumbangkan oleh jiran untuk diambil secara percuma. Tekan 'Tuntut' dan hubungi penderma untuk urusan serahan!
              </Text>
            </View>

            {donations
              .filter((item) => {
                const isBlocked = (item as any).isBlocked || (item as any).status === 'Disekat';
                if (isBlocked && item.donorId !== currentUser?.id) {
                  return false;
                }
                return true;
              })
              .map((item) => {
                const isItemBlocked = (item as any).isBlocked || (item as any).status === 'Disekat';
                return (
                  <View
                    key={item.id}
                    className="bg-white rounded-2xl p-3.5 mb-3 border border-gray-100 shadow-sm flex-row"
                  >
                    <Image source={{ uri: item.imageUrl }} className="w-24 h-24 rounded-xl bg-gray-100 mr-3" />
                    <View className="flex-1 justify-between">
                      <View>
                        <View className="flex-row justify-between items-start">
                          <Text className="text-sm font-bold text-gray-900 flex-1 mr-1" numberOfLines={1}>
                            {item.title}
                          </Text>
                          <View className={`px-2 py-0.5 rounded-full ${
                            isItemBlocked
                              ? 'bg-rose-100 border border-rose-200'
                              : item.status === 'Available'
                                ? 'bg-green-100'
                                : 'bg-gray-200'
                          }`}>
                            <Text className={`text-[10px] font-bold ${
                              isItemBlocked
                                ? 'text-rose-800'
                                : item.status === 'Available'
                                  ? 'text-green-800'
                                  : 'text-gray-600'
                            }`}>
                              {isItemBlocked ? 'Disekat' : item.status === 'Available' ? 'Tersedia' : 'Dituntut'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                          {item.description}
                        </Text>
                        <Text className="text-gray-400 text-[10px] mt-1">
                          Penderma: {item.donorName} • {item.distance} km
                        </Text>

                        {item.donorContactNotes ? (
                          <Text className="text-gray-500 text-[10px] italic mt-0.5">
                            Nota: {item.donorContactNotes}
                          </Text>
                        ) : null}
                      </View>

                      <View className="flex-row mt-2 space-x-2">
                        {/* Chat with Donor Button */}
                        <TouchableOpacity
                          onPress={() => {
                            setChatRecipient({
                              id: item.donorId,
                              name: item.donorName,
                              phone: item.donorPhone,
                              title: item.title,
                            });
                            setChatModalVisible(true);
                          }}
                          className="bg-purple-50 border border-purple-300 px-3 py-1.5 rounded-xl flex-row items-center mr-2"
                        >
                          <MessageCircle size={14} color="#9333ea" />
                          <Text className="text-purple-800 font-bold text-xs ml-1">Chat</Text>
                        </TouchableOpacity>

                        {isItemBlocked ? (
                          <View className="flex-1 py-1.5 items-center bg-rose-50 border border-rose-200 rounded-xl justify-center">
                            <Text className="text-rose-600 text-[11px] font-bold">Disekat oleh Admin</Text>
                          </View>
                        ) : item.status === 'Available' ? (
                          <TouchableOpacity
                            onPress={() => handleClaim(item)}
                            className="flex-1 bg-purple-700 py-1.5 rounded-xl items-center justify-center shadow-xs"
                          >
                            <Text className="text-white font-bold text-xs">Tuntut</Text>
                          </TouchableOpacity>
                        ) : (
                          <View className="flex-1 py-1.5 items-center bg-gray-100 rounded-xl justify-center">
                            <Text className="text-gray-400 text-[11px] font-semibold">Dituntut oleh {item.claimedBy}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

            <View className="h-28" />
          </ScrollView>

          {/* Floating Action Button "+ Sumbang Barang Derma" */}
          <TouchableOpacity
            onPress={() => {
              setDonorPhone(currentUser.phone || '');
              setDonorNotes('');
              setDonateModalVisible(true);
            }}
            className="absolute bottom-6 right-6 bg-purple-700 px-5 py-3.5 rounded-full flex-row items-center shadow-lg shadow-purple-900/40"
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-bold ml-1.5 text-sm">+ Sumbang Derma</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Center Details Modal with functional Call button */}
      {selectedCenter && (
        <Modal visible={true} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-xl font-bold text-gray-900">{selectedCenter.name}</Text>
                  <Text className="text-xs text-green-700 font-bold mt-0.5">
                    {selectedCenter.distance} km dari lokasi semasa
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCenter(null)}>
                  <X size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Alamat Fizikal</Text>
              <Text className="text-sm text-gray-800 mb-3">{selectedCenter.address}</Text>

              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Waktu Operasi</Text>
              <Text className="text-sm text-gray-800 mb-3">{selectedCenter.operatingHours}</Text>

              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Bahan Diterima</Text>
              <View className="flex-row flex-wrap mb-5">
                {selectedCenter.typesAccepted.map((t, idx) => (
                  <View key={idx} className="bg-gray-100 px-2.5 py-1 rounded-full mr-2 mb-1.5">
                    <Text className="text-xs text-gray-700 font-medium">{t}</Text>
                  </View>
                ))}
              </View>

              {/* Functional Contact Call Button */}
              {selectedCenter.contactPhone ? (
                <TouchableOpacity
                  onPress={() => handleCallCenter(selectedCenter.contactPhone)}
                  className="w-full bg-green-700 py-3.5 rounded-2xl items-center flex-row justify-center mb-2 shadow-md shadow-green-700/30"
                >
                  <Phone size={18} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Hubungi Pusat ({selectedCenter.contactPhone})
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => setSelectedCenter(null)}
                className="w-full bg-gray-100 py-3 rounded-2xl items-center"
              >
                <Text className="text-gray-700 font-bold text-sm">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Donate Item Form Modal */}
      <Modal visible={donateModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[92%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900">+ Sumbang Barang Derma Komuniti</Text>
              <TouchableOpacity onPress={() => setDonateModalVisible(false)}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ImagePickerButton
                title="Pilih / Muat Naik Gambar Barang Derma"
                selectedImageUri={donationImage}
                onImageSelected={(uri, base64) => {
                  setDonationImage(uri);
                  setDonationImageBase64(base64);
                }}
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Nama Barangan</Text>
              <TextInput
                placeholder="Contoh: Baju Sekolah Saiz S, Buku Teks, Meja Kecil"
                placeholderTextColor="#9ca3af"
                value={donationTitle}
                onChangeText={setDonationTitle}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Kategori Barangan</Text>
              <View className="flex-row flex-wrap mb-3">
                {RECYCLE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setDonationCat(cat)}
                    className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${
                      donationCat === cat ? 'bg-purple-700 border-purple-700' : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${donationCat === cat ? 'text-white' : 'text-gray-700'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Penerangan / Keadaan</Text>
              <TextInput
                placeholder="Nyatakan saiz, keadaan barang, dan lokasi pickup yang sesuai..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                value={donationDesc}
                onChangeText={setDonationDesc}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">No. Telefon / WhatsApp (Pilihan)</Text>
              <TextInput
                placeholder="Contoh: 012-3456789 (Pilihan)"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={donorPhone}
                onChangeText={setDonorPhone}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Nota Pengambilan (Pilihan)</Text>
              <TextInput
                placeholder="Contoh: Boleh ambil di surau atau lobi blok C."
                placeholderTextColor="#9ca3af"
                value={donorNotes}
                onChangeText={setDonorNotes}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-5 text-sm text-gray-900"
              />

              <TouchableOpacity
                onPress={handleCreateDonation}
                disabled={isUploading}
                className={`w-full ${isUploading ? 'bg-purple-400' : 'bg-purple-700'} py-4 rounded-2xl items-center shadow-md shadow-purple-900/30 mb-6`}
              >
                {isUploading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" className="mr-2" />
                    <Text className="text-white font-bold text-base">Memuat Naik ke Google Drive...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base">Siarkan Barang Derma Percuma</Text>
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

      {/* Chat with Donor Modal */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        recipient={{
          id: chatRecipient.id,
          name: chatRecipient.name,
          phone: chatRecipient.phone,
        }}
        itemContext={{
          title: chatRecipient.title,
          category: 'Barang Derma',
        }}
      />
    </SafeAreaView>
  );
}
