import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  CheckCircle, 
  Phone, 
  Clock, 
  Recycle, 
  Heart, 
  Gift, 
  AlertCircle 
} from 'lucide-react-native';
import { useRecycleStore } from '../../store/useRecycleStore';
import { useUserStore } from '../../store/useUserStore';
import { SmartRecommendation, RecycleCenter, DonationItem } from '../../types';
import SuccessModal from '../../components/SuccessModal';

const RECYCLE_CATEGORIES = [
  'Pakaian & Tekstil',
  'E-waste & Elektronik',
  'Kertas & Buku',
  'Plastik',
  'Kaca',
  'Logam & Besi'
];

const PRESET_ITEMS = [
  { name: 'Baju Lama', cat: 'Pakaian & Tekstil', cond: 'Masih elok' as const },
  { name: 'Telefon Pintar Rosak', cat: 'E-waste & Elektronik', cond: 'Rosak / Tidak Berfungsi' as const },
  { name: 'Buku Rujukan', cat: 'Kertas & Buku', cond: 'Masih elok' as const },
  { name: 'Kabel Komputer Lama', cat: 'E-waste & Elektronik', cond: 'Rosak / Tidak Berfungsi' as const },
  { name: 'Botol Plastik 1.5L', cat: 'Plastik', cond: 'Rosak / Tidak Berfungsi' as const },
];

export default function RecycleScreen() {
  const { centers, donations, claimDonation, getSmartRecommendation } = useRecycleStore();
  const { currentUser, addGreenPoints } = useUserStore();

  const [activeSubTab, setActiveSubTab] = useState<'SmartEngine' | 'Directory' | 'ClaimFeed'>('SmartEngine');

  // Smart Engine Form State
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(RECYCLE_CATEGORIES[0]);
  const [condition, setCondition] = useState<'Masih elok' | 'Rosak / Tidak Berfungsi'>('Masih elok');
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);

  // Center Filter State
  const [centerTypeFilter, setCenterTypeFilter] = useState<'Semua' | 'RecycleCenter' | 'NGO'>('Semua');

  // Success Feedback Modal
  const [successVisible, setSuccessVisible] = useState(false);
  const [successPoints, setSuccessPoints] = useState(0);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Center Details Modal
  const [selectedCenter, setSelectedCenter] = useState<RecycleCenter | null>(null);

  const handleAnalyze = () => {
    if (!itemName.trim()) {
      alert('Sila masukkan nama barangan terlebih dahulu.');
      return;
    }
    const result = getSmartRecommendation(itemName, category, condition);
    setRecommendation(result);
  };

  const handleDropoffAction = (centerName: string, points: number) => {
    addGreenPoints(
      points,
      `${currentUser.name} mengitar semula / mendermakan ${itemName}`,
      `Dihantar ke ${centerName}`,
      'recycle'
    );
    setSuccessPoints(points);
    setSuccessTitle('Aktiviti Lestari Berjaya!');
    setSuccessMsg(`Terima kasih kerana menghantar barangan ke ${centerName}. Tindakan anda menyokong matlamat kelestarian komuniti.`);
    setSuccessVisible(true);
    setRecommendation(null);
    setItemName('');
  };

  const handleClaim = (donation: DonationItem) => {
    claimDonation(donation.id, currentUser.name);
    addGreenPoints(
      15,
      `${currentUser.name} menuntut barang derma (${donation.title})`,
      'Guna semula barangan terpakai komuniti',
      'donation'
    );
    setSuccessPoints(15);
    setSuccessTitle('Tuntutan Berjaya!');
    setSuccessMsg(`Anda telah menuntut "${donation.title}". Sila hubungi penderma (${donation.donorName}) untuk tetapkan waktu pengambilan.`);
    setSuccessVisible(true);
  };

  const filteredCenters = centers.filter((c) => {
    if (centerTypeFilter === 'Semua') return true;
    return c.type === centerTypeFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-green-700">
        <Text className="text-2xl font-black text-white text-center">Donate & Recycle</Text>
        <Text className="text-green-100 text-xs text-center mt-0.5">
          Sistem Cadangan Pintar & Kitar Semula Komuniti
        </Text>
      </View>

      {/* Subtabs Header */}
      <View className="flex-row bg-gray-100 p-1.5 mx-5 mt-3 rounded-2xl">
        <TouchableOpacity
          onPress={() => setActiveSubTab('SmartEngine')}
          className={`flex-1 py-2 rounded-xl items-center ${
            activeSubTab === 'SmartEngine' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
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
          className={`flex-1 py-2 rounded-xl items-center ${
            activeSubTab === 'Directory' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
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
          className={`flex-1 py-2 rounded-xl items-center ${
            activeSubTab === 'ClaimFeed' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
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
            Uji Sistem Cadangan (Smart Decision System)
          </Text>
          <Text className="text-gray-500 text-xs mb-3">
            Sistem menganalisis barangan anda sama ada sesuai untuk didermakan atau dikitar semula mengikut peraturan SDG 12.
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
                <View className={`w-8 h-8 rounded-full ${recommendation.decision === 'Derma' ? 'bg-purple-100' : 'bg-emerald-100'} items-center justify-center mr-2`}>
                  {recommendation.decision === 'Derma' ? (
                    <Heart size={18} color="#9333ea" />
                  ) : (
                    <Recycle size={18} color="#059669" />
                  )}
                </View>
                <Text className="text-base font-bold text-gray-900 flex-1">
                  {recommendation.title}
                </Text>
              </View>

              <Text className="text-gray-600 text-xs leading-5 mb-4">
                {recommendation.explanation}
              </Text>

              <View className="bg-green-50 p-3 rounded-xl mb-4 border border-green-100 flex-row items-center justify-between">
                <Text className="text-green-900 font-bold text-xs">Ganjaran Mata Hijau Potensi:</Text>
                <Text className="text-green-700 font-black text-sm">+{recommendation.potentialGreenPoints} pts</Text>
              </View>

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

                  <TouchableOpacity
                    onPress={() => handleDropoffAction(c.name, recommendation.potentialGreenPoints)}
                    className="mt-3 bg-green-600 py-2.5 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-xs">
                      Selesai Hantar ke Sini (+{recommendation.potentialGreenPoints} pts)
                    </Text>
                  </TouchableOpacity>
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

          {/* Interactive Map Visual */}
          <View className="bg-slate-200 rounded-2xl h-36 mb-4 relative overflow-hidden items-center justify-center border border-slate-300">
            <View className="absolute top-6 left-8 items-center">
              <MapPin size={28} color="#dc2626" fill="#fecaca" />
              <Text className="text-[10px] font-bold bg-white px-1.5 rounded shadow">NGO Prihatin</Text>
            </View>
            <View className="absolute top-10 right-10 items-center">
              <MapPin size={28} color="#16a34a" fill="#bbf7d0" />
              <Text className="text-[10px] font-bold bg-white px-1.5 rounded shadow">Kitar Semula JB</Text>
            </View>
            <View className="absolute bottom-4 left-1/2 -ml-12 items-center">
              <MapPin size={24} color="#2563eb" fill="#bfdbfe" />
              <Text className="text-[10px] font-bold bg-white px-1.5 rounded shadow">E-Waste Hub</Text>
            </View>
            <View className="bg-white/90 px-3 py-1 rounded-full shadow-sm">
              <Text className="text-gray-700 text-xs font-bold">📍 Radius Kawasan Anda (5 km)</Text>
            </View>
          </View>

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
                      {center.type === 'NGO' ? 'NGO Derma' : 'Kitar Semula'}
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
        <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
          <View className="bg-purple-50 p-4 rounded-2xl mb-4 border border-purple-100">
            <View className="flex-row items-center mb-1">
              <Gift size={18} color="#9333ea" />
              <Text className="text-purple-900 font-bold text-sm ml-1.5">Barang Percuma Komuniti (Claim)</Text>
            </View>
            <Text className="text-purple-700 text-xs leading-4">
              Barangan elok yang disumbangkan oleh jiran untuk diambil percuma (First Come First Serve). Jimat wang & kurangkan pembaziran!
            </Text>
          </View>

          {donations.map((item) => (
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
                    <View className={`px-2 py-0.5 rounded-full ${item.status === 'Available' ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Text className={`text-[10px] font-bold ${item.status === 'Available' ? 'text-green-800' : 'text-gray-600'}`}>
                        {item.status === 'Available' ? 'Tersedia' : 'Dituntut'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text className="text-gray-400 text-[10px] mt-1">
                    Penderma: {item.donorName} • {item.distance} km
                  </Text>
                </View>

                {item.status === 'Available' ? (
                  <TouchableOpacity
                    onPress={() => handleClaim(item)}
                    className="bg-purple-600 py-2 rounded-xl items-center mt-2 shadow-sm"
                  >
                    <Text className="text-white font-bold text-xs">Tuntut (Claim Percuma)</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="py-1.5 items-center mt-2 bg-gray-100 rounded-xl">
                    <Text className="text-gray-400 text-xs font-semibold">Telah dituntut oleh {item.claimedBy}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <View className="h-16" />
        </ScrollView>
      )}

      {/* Center Details Modal */}
      {selectedCenter && (
        <Modal visible={true} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <Text className="text-xl font-bold text-gray-900 mb-1">{selectedCenter.name}</Text>
              <Text className="text-xs text-green-700 font-bold mb-4">{selectedCenter.distance} km dari lokasi semasa</Text>

              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Alamat</Text>
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

              <TouchableOpacity
                onPress={() => setSelectedCenter(null)}
                className="w-full bg-green-700 py-3.5 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-sm">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={successVisible}
        points={successPoints}
        title={successTitle}
        message={successMsg}
        onClose={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
}
