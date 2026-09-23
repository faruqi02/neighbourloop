import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Image, 
  Linking 
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
  ChevronLeft
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
  const { requests, addRequest, fulfillRequest, fetchHelpRequests, loading } = useHelpStore();
  const { currentUser } = useUserStore();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    fetchHelpRequests();
  }, []);

  if (!currentUser) return null;

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
  const [requesterPhone, setRequesterPhone] = useState(currentUser.phone || '');
  const [requesterNotes, setRequesterNotes] = useState(currentUser.contactNotes || '');

  // Success Feedback Modal
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Chat Modal
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const filteredRequests = requests.filter((r) => {
    const matchType = r.type === activeTab;
    const matchCat = selectedCategory === 'Semua' || r.category === selectedCategory;
    return matchType && matchCat;
  });

  const handleCreateRequest = () => {
    if (!title.trim()) {
      alert('Sila masukkan tajuk bantuan.');
      return;
    }

    addRequest({
      title,
      description: description || 'Bantuan komuniti kejiranan.',
      category,
      type: newType,
      distance: 0.4,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterPhone: requesterPhone.trim() || undefined,
      requesterContactNotes: requesterNotes.trim() || undefined,
      imageUrl: selectedImage || undefined,
    });

    setCreateModalVisible(false);
    setTitle('');
    setDescription('');
    setSelectedImage('');
    setSuccessTitle('Bantuan Berjaya Disiarkan!');
    setSuccessMsg(`Posting "${title}" anda kini dapat dilihat oleh jiran sekitar ${currentUser.location}.`);
    setSuccessVisible(true);
  };

  const handleFulfillHelp = (req: HelpRequest) => {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-6 bg-purple-600">
        <View className="flex-row items-center justify-center relative">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
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
          setRequesterPhone(currentUser.phone || '');
          setRequesterNotes(currentUser.contactNotes || '');
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

                <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
                  <Text className="text-xs text-gray-400 font-semibold uppercase mb-1">
                    {selectedRequest.type === 'Permintaan' ? 'Pemohon Bantuan' : 'Pemberi Bantuan'}
                  </Text>
                  <Text className="text-sm font-bold text-gray-800">{selectedRequest.requesterName}</Text>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={14} color="#16a34a" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {selectedRequest.distance} km dari lokasi anda
                    </Text>
                  </View>

                  {/* Contact details */}
                  {selectedRequest.requesterPhone ? (
                    <View className="mt-2 pt-2 border-t border-gray-200 flex-row justify-between items-center">
                      <View>
                        <Text className="text-[10px] text-gray-400 uppercase font-semibold">No. WhatsApp</Text>
                        <Text className="text-xs font-bold text-gray-800">{selectedRequest.requesterPhone}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleOpenWhatsApp(selectedRequest.requesterPhone)}
                        className="bg-green-600 px-3 py-1.5 rounded-xl flex-row items-center"
                      >
                        <Phone size={12} color="white" />
                        <Text className="text-white text-xs font-bold ml-1">WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {/* Direct In-App Chat Button */}
                <TouchableOpacity
                  onPress={() => setChatModalVisible(true)}
                  className="w-full bg-purple-700 py-3.5 rounded-2xl flex-row justify-center items-center shadow-md shadow-purple-900/30 mb-2.5"
                >
                  <MessageSquare size={18} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Mesej Jiran (Chatbox)
                  </Text>
                </TouchableOpacity>

                {selectedRequest.status === 'Completed' ? (
                  <View className="py-3 rounded-2xl bg-gray-100 items-center">
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
                onImageSelected={setSelectedImage}
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
                className="w-full bg-purple-700 py-4 rounded-2xl items-center shadow-md shadow-purple-900/30 mb-6"
              >
                <Text className="text-white font-bold text-base">Siarkan Kepada Jiran</Text>
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
      {selectedRequest && (
        <ChatModal
          visible={chatModalVisible}
          onClose={() => setChatModalVisible(false)}
          recipient={{
            id: selectedRequest.requesterId,
            name: selectedRequest.requesterName,
            phone: selectedRequest.requesterPhone,
          }}
          itemContext={{
            title: selectedRequest.title,
            category: 'Help Nearby',
          }}
        />
      )}
    </SafeAreaView>
  );
}
