import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Modal,
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MapPin, X, MessageCircle, Phone, Tag, CheckCircle2 } from 'lucide-react-native';
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
  const { listings, addListing } = useMarketStore();
  const { currentUser } = useUserStore();

  if (!currentUser) return null;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Form State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Perabot' | 'Elektronik' | 'Pakaian' | 'Lain-lain'>('Perabot');
  const [condition, setCondition] = useState<'Baru' | 'Seperti Baru' | 'Terpakai'>('Terpakai');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0]);
  const [sellerPhone, setSellerPhone] = useState(currentUser.phone || '');
  const [sellerContactNotes, setSellerContactNotes] = useState(currentUser.contactNotes || '');

  // Success Feedback
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Interactive Chat Modal
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const filteredListings = listings.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateListing = () => {
    if (!title.trim() || !price) {
      alert('Sila masukkan tajuk dan harga barang.');
      return;
    }

    addListing({
      title,
      description: description || 'Barangan preloved berkeadaan elok.',
      price: parseFloat(price) || 0,
      category,
      condition,
      distance: 0.8,
      imageUrl: selectedImage || PRESET_IMAGES[0],
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerPhone: sellerPhone.trim() || undefined,
      sellerContactNotes: sellerContactNotes.trim() || undefined,
    });

    setCreateModalVisible(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setSuccessMsg('Barangan anda berjaya dimuat naik ke ruangan jualan kejiranan.');
    setSuccessVisible(true);
  };

  const handleOpenWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
    Linking.openURL(`whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(`Salam, saya berminat dengan barang "${selectedListing?.title}" di NeighbourLoop.`)}`).catch(() => {
      Linking.openURL(`https://wa.me/${intlPhone}`);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 border-b border-gray-100">
        <Text className="text-2xl font-black text-gray-900 mb-3">Marketplace Jiran</Text>

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-1">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                selectedCategory === cat
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-600'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings Stream */}
      <ScrollView className="px-5 flex-1 pt-3" showsVerticalScrollIndicator={false}>
        {filteredListings.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Tag size={40} color="#9ca3af" />
            <Text className="text-gray-400 mt-2 font-semibold">Tiada barang dijumpai.</Text>
          </View>
        ) : (
          filteredListings.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelectedListing(item)}
              className="flex-row bg-white rounded-2xl p-3 mb-3 border border-gray-100 shadow-sm shadow-gray-200"
            >
              <Image
                source={{ uri: item.imageUrl }}
                className="w-24 h-24 rounded-xl bg-gray-100"
              />
              <View className="flex-1 ml-3.5 justify-between py-0.5">
                <View>
                  <View className="flex-row justify-between items-start">
                    <Text className="text-base font-bold text-gray-900 flex-1 mr-1" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View className="bg-blue-50 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-bold text-blue-700">{item.condition}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>

                <View className="flex-row justify-between items-end">
                  <Text className="text-green-700 font-black text-lg">RM {item.price.toFixed(0)}</Text>
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-0.5">{item.distance} km</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Button "+ Jual Barang" */}
      <TouchableOpacity
        onPress={() => {
          setSellerPhone(currentUser.phone || '');
          setSellerContactNotes(currentUser.contactNotes || '');
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

                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-2xl font-black text-green-700">
                    RM {selectedListing.price.toFixed(0)}
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
                <View className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-200">
                  <Text className="text-xs text-gray-400 font-semibold uppercase mb-1">Penjual</Text>
                  <Text className="text-sm font-bold text-gray-800">{selectedListing.sellerName}</Text>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={14} color="#16a34a" />
                    <Text className="text-xs text-gray-600 ml-1">
                      Berdekatan ({selectedListing.distance} km dari lokasi anda)
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
                      <TouchableOpacity
                        onPress={() => handleOpenWhatsApp(selectedListing.sellerPhone)}
                        className="bg-green-600 px-3 py-1.5 rounded-xl flex-row items-center"
                      >
                        <Phone size={12} color="white" />
                        <Text className="text-white text-xs font-bold ml-1">WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {/* Main Action: Chatbox Direct Launch */}
                <TouchableOpacity
                  onPress={() => setChatModalVisible(true)}
                  className="w-full bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-600/30 mb-3"
                >
                  <MessageCircle size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Mesej Penjual (Chatbox)
                  </Text>
                </TouchableOpacity>
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
                onImageSelected={setSelectedImage}
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

              {/* Submit Button (Clean, no points) */}
              <TouchableOpacity
                onPress={handleCreateListing}
                className="w-full bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-600/30"
              >
                <Text className="text-white font-bold text-base">Siarkan Iklan Jualan</Text>
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
      {selectedListing && (
        <ChatModal
          visible={chatModalVisible}
          onClose={() => setChatModalVisible(false)}
          recipient={{
            id: selectedListing.sellerId,
            name: selectedListing.sellerName,
            phone: selectedListing.sellerPhone,
          }}
          itemContext={{
            title: selectedListing.title,
            price: selectedListing.price,
            category: 'Marketplace',
          }}
        />
      )}
    </SafeAreaView>
  );
}
