import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HeartHandshake, 
  Plus, 
  MapPin, 
  CheckCircle, 
  X, 
  Sparkles, 
  User, 
  Tag 
} from 'lucide-react-native';
import { useHelpStore } from '../../store/useHelpStore';
import { useUserStore } from '../../store/useUserStore';
import { HelpRequest } from '../../types';
import SuccessModal from '../../components/SuccessModal';

const CATEGORIES = ['Semua', 'Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain'];

export default function HelpScreen() {
  const { requests, addRequest, fulfillRequest } = useHelpStore();
  const { currentUser, addGreenPoints } = useUserStore();

  const [activeTab, setActiveTab] = useState<'Permintaan' | 'Tawaran'>('Permintaan');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  // Create Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newType, setNewType] = useState<'Permintaan' | 'Tawaran'>('Permintaan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Pinjam Barang' | 'Khidmat/Tenaga' | 'Kemahiran' | 'Lain-lain'>('Pinjam Barang');
  const [rewardPoints, setRewardPoints] = useState(20);

  // Success Feedback Modal
  const [successVisible, setSuccessVisible] = useState(false);
  const [successPoints, setSuccessPoints] = useState(0);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredRequests = requests.filter((r) => {
    const matchType = r.type === activeTab;
    const matchCat = selectedCategory === 'Semua' || r.category === selectedCategory;
    return matchType && matchCat;
  });

  const handleCreateRequest = () => {
    if (!title.trim()) {
      alert('Sila masukkan tajuk permintaan/tawaran bantuan.');
      return;
    }

    addRequest({
      title,
      description: description || 'Bantuan komuniti untuk kejiranan.',
      category,
      type: newType,
      distance: 0.4,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      rewardPoints,
    });

    setCreateModalVisible(false);
    setTitle('');
    setDescription('');
    setSuccessPoints(5);
    setSuccessTitle('Bantuan Berjaya Disiarkan!');
    setSuccessMsg(`Posting "${title}" anda kini dapat dilihat oleh jiran dalam komuniti ${currentUser.location}.`);
    setSuccessVisible(true);
  };

  const handleFulfillHelp = (req: HelpRequest) => {
    const pts = fulfillRequest(req.id, currentUser.name);
    addGreenPoints(
      pts,
      `${currentUser.name} membantu jiran: ${req.title}`,
      `Bantuan kepada ${req.requesterName} diselesaikan dengan jayanya!`,
      'help'
    );
    setSelectedRequest(null);
    setSuccessPoints(pts);
    setSuccessTitle('Terima Kasih Atas Bantuan Anda!');
    setSuccessMsg(`Hebat! Anda telah bersetuju membantu ${req.requesterName}. Hubungan kejiranan semakin erat dan anda menerima +${pts} Mata Hijau.`);
    setSuccessVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-5 bg-purple-700">
        <Text className="text-2xl font-black text-white text-center">Help Nearby</Text>
        <Text className="text-purple-200 text-xs text-center mt-0.5">
          Saling Membantu & Berkongsi Sumber Sesama Jiran
        </Text>
      </View>

      <View className="flex-1 bg-gray-50 px-5 -mt-3 rounded-t-3xl pt-4">
        {/* Permintaan vs Tawaran Tabs */}
        <View className="flex-row bg-gray-200/70 rounded-2xl p-1 mb-3">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === 'Permintaan' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
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
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === 'Tawaran' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 max-h-8">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-2 px-3.5 py-1 rounded-full border ${
                selectedCategory === cat
                  ? 'bg-purple-700 border-purple-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-600'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Help Requests Stream */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                  <View className="bg-purple-50 px-2.5 py-0.5 rounded-md self-start">
                    <Text className="text-[10px] font-bold text-purple-700">{req.category}</Text>
                  </View>
                  <View className="flex-row items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <Sparkles size={12} color="#16a34a" />
                    <Text className="text-[10px] font-bold text-green-700 ml-1">+{req.rewardPoints} pts</Text>
                  </View>
                </View>

                <Text className="text-base font-bold text-gray-900 mb-1">{req.title}</Text>
                <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>
                  {req.description}
                </Text>

                <View className="flex-row justify-between items-center pt-2 border-t border-gray-50">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-purple-100 items-center justify-center mr-1.5">
                      <User size={12} color="#7e22ce" />
                    </View>
                    <Text className="text-xs text-gray-700 font-semibold">{req.requesterName}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-0.5">{req.distance} km</Text>
                  </View>
                </View>
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
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-3">
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-purple-800 font-bold text-xs">{selectedRequest.category}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                  <X size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text className="text-xl font-bold text-gray-900 mb-2">{selectedRequest.title}</Text>
              <Text className="text-gray-600 text-sm mb-4 leading-5">{selectedRequest.description}</Text>

              <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                <Text className="text-xs text-gray-400 font-semibold uppercase mb-1">
                  {selectedRequest.type === 'Permintaan' ? 'Pemohon' : 'Pemberi Bantuan'}
                </Text>
                <Text className="text-sm font-bold text-gray-800">{selectedRequest.requesterName}</Text>
                <View className="flex-row items-center mt-1">
                  <MapPin size={14} color="#16a34a" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {selectedRequest.distance} km dari lokasi anda
                  </Text>
                </View>
              </View>

              <View className="bg-green-50 p-3 rounded-2xl mb-5 flex-row items-center justify-between border border-green-200">
                <Text className="text-green-800 font-bold text-xs">Ganjaran Mata Hijau Selesai:</Text>
                <Text className="text-green-700 font-black text-sm">+{selectedRequest.rewardPoints} pts</Text>
              </View>

              {selectedRequest.status === 'Completed' ? (
                <View className="py-3.5 rounded-2xl bg-gray-100 items-center">
                  <Text className="text-gray-400 font-bold text-sm">Bantuan ini telah diselesaikan</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleFulfillHelp(selectedRequest)}
                  className="w-full bg-purple-700 py-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-purple-900/30"
                >
                  <HeartHandshake size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    {selectedRequest.type === 'Permintaan' ? 'Bantu Jiran Ini Sekarang' : 'Terima Tawaran Bantuan'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Create Help Item Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
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

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Tajuk Bantuan</Text>
              <TextInput
                placeholder={newType === 'Permintaan' ? 'Contoh: Pinjam tangga lipat 1 jam' : 'Contoh: Sedia tumpang beli barang dapur'}
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
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
              />

              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Ganjaran Mata Hijau Ditawarkan</Text>
              <View className="flex-row mb-5">
                {[15, 20, 30, 50].map((pts) => (
                  <TouchableOpacity
                    key={pts}
                    onPress={() => setRewardPoints(pts)}
                    className={`flex-1 mr-2 py-2 rounded-xl border items-center ${
                      rewardPoints === pts ? 'bg-purple-700 border-purple-700' : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${rewardPoints === pts ? 'text-white' : 'text-gray-700'}`}>
                      {pts} pts
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleCreateRequest}
                className="w-full bg-purple-700 py-4 rounded-2xl items-center shadow-md shadow-purple-900/30"
              >
                <Text className="text-white font-bold text-base">Siarkan Kepada Jiran</Text>
              </TouchableOpacity>
              <View className="h-6" />
            </ScrollView>
          </View>
        </View>
      </Modal>

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
