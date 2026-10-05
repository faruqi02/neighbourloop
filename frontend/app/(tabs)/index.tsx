import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { useNoticeStore } from '../../store/useNoticeStore';
import { 
  MapPin, 
  ShoppingCart, 
  HeartHandshake, 
  ChevronRight, 
  Bell, 
  Calendar, 
  Clock, 
  Users, 
  PlusCircle,
  Plus,
  Megaphone, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import LocationModal from '../../components/LocationModal';
import NoticeDetailModal from '../../components/NoticeDetailModal';
import { CommunityNotice } from '../../types';

const recycleIcon = require('../../images/recycle_icon.png');
const neighbourloopLogo = require('../../images/neighbourloop_glow.png');

export default function HomeDashboard() {
  const { currentUser } = useUserStore();
  const { notices, fetchNotices, addNotice } = useNoticeStore();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotices();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<CommunityNotice | null>(null);

  // Community Notice Creation Modal State
  const [addNoticeModalVisible, setAddNoticeModalVisible] = useState(false);
  const [submittedReviewVisible, setSubmittedReviewVisible] = useState(false);
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  // Form Fields
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'Gotong-Royong' | 'Penyelenggaraan' | 'Keselamatan' | 'Aktiviti Komuniti' | 'Umum'>('Gotong-Royong');
  const [noticeDesc, setNoticeDesc] = useState('');
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [noticeTime, setNoticeTime] = useState('08:30 AM');
  const [noticeLocation, setNoticeLocation] = useState('');
  const [noticeOrganizer, setNoticeOrganizer] = useState('');
  const [noticeContact, setNoticeContact] = useState('');
  const [noticeImportant, setNoticeImportant] = useState(false);

  const handleOpenAddNotice = () => {
    setNoticeTitle('');
    setNoticeCategory('Gotong-Royong');
    setNoticeDesc('');
    setNoticeDate(new Date().toISOString().split('T')[0]);
    setNoticeTime('08:30 AM');
    setNoticeLocation(currentUser?.location || '');
    setNoticeOrganizer(currentUser?.name || 'Penduduk Komuniti');
    setNoticeContact(currentUser?.phone || '');
    setNoticeImportant(false);
    setAddNoticeModalVisible(true);
  };

  const handleSubmitNotice = async () => {
    if (!noticeTitle.trim()) {
      Alert.alert('Ralat', 'Sila masukkan tajuk notis.');
      return;
    }
    if (!noticeLocation.trim()) {
      Alert.alert('Ralat', 'Sila masukkan lokasi notis.');
      return;
    }
    if (!noticeDesc.trim()) {
      Alert.alert('Ralat', 'Sila masukkan keterangan ringkas notis.');
      return;
    }

    setIsSubmittingNotice(true);
    try {
      const success = await addNotice({
        title: noticeTitle.trim(),
        category: noticeCategory,
        description: noticeDesc.trim(),
        date: noticeDate.trim() || new Date().toISOString().split('T')[0],
        time: noticeTime.trim() || undefined,
        location: noticeLocation.trim(),
        organizer: noticeOrganizer.trim() || (currentUser?.name || 'Penduduk Komuniti'),
        contactPerson: noticeContact.trim() || undefined,
        isImportant: noticeImportant,
        status: 'Pending',
        authorId: currentUser?.id,
        authorName: currentUser?.username || currentUser?.name || 'jiran',
      });

      if (success) {
        setAddNoticeModalVisible(false);
        setSubmittedReviewVisible(true);
        fetchNotices();
      } else {
        Alert.alert('Ralat', 'Gagal menghantar notis. Sila semak sambungan internet anda.');
      }
    } catch {
      Alert.alert('Ralat', 'Terdapat masalah teknikal semasa menghantar notis.');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Location Bar */}
      <View className="flex-row justify-between items-center px-5 pt-3 pb-2 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => setLocationModalVisible(true)}
          className="flex-row items-center bg-green-50/90 px-3 py-1.5 rounded-full border border-green-200"
        >
          <MapPin size={16} color="#16a34a" />
          <Text className="text-gray-900 font-bold ml-1.5 text-xs max-w-[200px]" numberOfLines={1}>
            {currentUser.location}
          </Text>
          <Text className="text-green-700 font-semibold text-xs ml-1">
            ({currentUser.radiusKm || 5}km)
          </Text>
          <ChevronRight size={14} color="#16a34a" className="ml-0.5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={{ uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }} 
            className="w-10 h-10 rounded-full border-2 border-green-600"
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
        }
      >
        {/* User Greeting & Tagline */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-gray-900">
            Hai, {currentUser.name}! 👋
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">
            Komuniti Prihatin. Kongsi Sumber. Saling Membantu.
          </Text>
        </View>

        {/* Welcome Community Banner (Clean, no points, no SDG) */}
        <View className="bg-gradient-to-r from-emerald-600 to-green-700 bg-green-700 rounded-3xl p-5 mb-6 shadow-md shadow-green-900/20">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center bg-white/20 self-start px-2.5 py-1 rounded-full mb-2">
                <Users size={14} color="#ffffff" />
                <Text className="text-white text-xs font-bold ml-1.5">Zon Komuniti Aktif</Text>
              </View>
              <Text className="text-white text-xl font-black">{currentUser.location}</Text>
              <Text className="text-green-100 text-xs mt-1 leading-4">
                Platform kejiranan setempat untuk jual beli preloved, derma barangan, dan bantuan sesama jiran.
              </Text>
            </View>
            <View className="items-center justify-center pl-1">
              <Image 
                source={neighbourloopLogo} 
                style={{ 
                  width: 88, 
                  height: 52,
                  shadowColor: '#ffffff',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.9,
                  shadowRadius: 10,
                }} 
                resizeMode="contain" 
              />
            </View>
          </View>
        </View>

        {/* 3 Core Pillars Section */}
        <Text className="text-lg font-bold text-gray-900 mb-3">3 Fungsi Utama</Text>
        <View className="flex-row justify-between mb-6">
          {/* Marketplace */}
          <TouchableOpacity 
            onPress={() => router.push('/marketplace')}
            className="w-[31%] bg-blue-50/90 rounded-2xl p-3.5 items-center border border-blue-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl bg-blue-500 items-center justify-center mb-2 shadow-sm shadow-blue-500/30">
              <ShoppingCart size={24} color="#ffffff" />
            </View>
            <Text className="text-xs font-bold text-blue-900 text-center">Marketplace</Text>
            <Text className="text-[10px] text-blue-600 text-center mt-0.5">Jual & Beli</Text>
          </TouchableOpacity>

          {/* Smart Recycle & Donate with custom recycle_icon.png */}
          <TouchableOpacity 
            onPress={() => router.push('/recycle')}
            className="w-[31%] bg-green-50/90 rounded-2xl p-3.5 items-center border border-green-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-sm shadow-green-600/25 overflow-hidden">
              <Image source={recycleIcon} style={{ width: 48, height: 48, borderRadius: 14 }} className="w-12 h-12 rounded-2xl" resizeMode="contain" />
            </View>
            <Text className="text-xs font-bold text-green-900 text-center">Donate & Recycle</Text>
            <Text className="text-[10px] text-green-700 text-center mt-0.5">Derma & Kitar</Text>
          </TouchableOpacity>

          {/* Help Nearby */}
          <TouchableOpacity 
            onPress={() => router.push('/help')}
            className="w-[31%] bg-purple-50/90 rounded-2xl p-3.5 items-center border border-purple-100 shadow-sm"
          >
            <View className="w-12 h-12 rounded-2xl bg-purple-600 items-center justify-center mb-2 shadow-sm shadow-purple-600/30">
              <HeartHandshake size={24} color="#ffffff" />
            </View>
            <Text className="text-xs font-bold text-purple-900 text-center">Help Nearby</Text>
            <Text className="text-[10px] text-purple-700 text-center mt-0.5">Bantuan Jiran</Text>
          </TouchableOpacity>
        </View>

        {/* Informasi Komuniti (Gotong-Royong, Kerja Baiki Jalan, dsb) */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Megaphone size={18} color="#059669" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Informasi Komuniti</Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenAddNotice}
            className="flex-row items-center bg-emerald-600 px-3 py-1.5 rounded-full shadow-xs active:scale-95"
          >
            <Plus size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold ml-1">+ Tambah Notis</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          {notices.length === 0 ? (
            <View className="bg-gray-50 rounded-2xl p-6 items-center border border-gray-100 shadow-xs">
              <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-2 border border-emerald-100">
                <Megaphone size={22} color="#059669" />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Tiada Notis Komuniti Buat Masa Ini</Text>
              <Text className="text-gray-400 text-xs text-center mt-1 max-w-[260px]">
                Hebahan terkini, gotong-royong, atau penyelenggaraan akan dipaparkan di sini.
              </Text>
              <TouchableOpacity
                onPress={handleOpenAddNotice}
                className="mt-3.5 bg-emerald-600 px-4 py-2 rounded-xl flex-row items-center shadow-xs active:scale-95"
              >
                <Plus size={14} color="#ffffff" />
                <Text className="text-white text-xs font-bold ml-1.5">Cipta Notis Komuniti</Text>
              </TouchableOpacity>
            </View>
          ) : (
            notices.map((item) => {
              const isPending = item.status === 'Pending';
              let catBg = 'bg-emerald-50 border-emerald-200';
              let catText = 'text-emerald-800';

              if (item.category === 'Penyelenggaraan') {
                catBg = 'bg-amber-50 border-amber-200';
                catText = 'text-amber-800';
              } else if (item.category === 'Keselamatan') {
                catBg = 'bg-blue-50 border-blue-200';
                catText = 'text-blue-800';
              } else if (item.category.includes('Aktiviti')) {
                catBg = 'bg-purple-50 border-purple-200';
                catText = 'text-purple-800';
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedNotice(item)}
                  className={`bg-white rounded-2xl p-4 mb-3.5 border ${isPending ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'} shadow-sm`}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <View className={`px-2.5 py-0.5 rounded-md border ${catBg}`}>
                        <Text className={`text-[10px] font-bold ${catText}`}>{item.category}</Text>
                      </View>
                      {item.isImportant ? (
                        <View className="bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex-row items-center">
                          <AlertCircle size={10} color="#b91c1c" />
                          <Text className="text-[10px] font-bold text-rose-700 ml-1">Penting</Text>
                        </View>
                      ) : null}
                      {isPending && (
                        <View className="bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 flex-row items-center">
                          <Clock size={10} color="#b45309" />
                          <Text className="text-[10px] font-bold text-amber-800 ml-1">Menunggu Kelulusan (In Review)</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-400 text-[11px]">{item.createdAt}</Text>
                  </View>

                  <Text className="text-base font-bold text-gray-900 mb-1.5 leading-5">
                    {item.title}
                  </Text>

                  <Text className="text-gray-600 text-xs mb-3 leading-4" numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <View className="flex-row items-center mb-1">
                      <Calendar size={13} color="#059669" />
                      <Text className="text-[11px] font-semibold text-gray-700 ml-1.5">{item.date}</Text>
                      {item.time ? (
                        <>
                          <Text className="text-gray-300 mx-1.5">•</Text>
                          <Clock size={13} color="#059669" />
                          <Text className="text-[11px] font-semibold text-gray-700 ml-1.5">{item.time}</Text>
                        </>
                      ) : null}
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={13} color="#dc2626" />
                      <Text className="text-[11px] text-gray-600 ml-1.5 font-medium" numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-gray-100">
                    <Text className="text-[11px] text-gray-500 font-medium">
                      Oleh: <Text className="text-gray-800 font-semibold">{item.organizer}</Text>
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-xs font-bold text-emerald-700 mr-0.5">Lihat Butiran</Text>
                      <ChevronRight size={14} color="#047857" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Modal Cipta Notis Komuniti Baharu (Boleh Dibuat Secara Umum) */}
      <Modal visible={addNoticeModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
          >
            <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-black text-gray-900">Kongsi Informasi Komuniti</Text>
                <Text className="text-xs text-gray-500">Hebahan, aktiviti atau notis kejiranan</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setAddNoticeModalVisible(false)} 
                className="p-1.5 bg-gray-100 rounded-full"
              >
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              className="flex-1 px-5 pt-3" 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{ paddingBottom: 250 }}
            >
            {/* Info Review Alert */}
            <View className="bg-amber-50 p-3.5 rounded-2xl mb-4 border border-amber-200 flex-row items-start">
              <Clock size={16} color="#b45309" className="mt-0.5" />
              <View className="ml-2 flex-1">
                <Text className="text-xs font-bold text-amber-900">Perhatian: Tapisan Pentadbir (Admin Review)</Text>
                <Text className="text-[11px] text-amber-700 mt-0.5 leading-4">
                  Setiap notis yang dihantar oleh penduduk akan disemak oleh pihak Admin terlebih dahulu sebelum dipaparkan secara rasmi kepada umum.
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Tajuk Notis / Aktiviti *</Text>
            <TextInput
              placeholder="Contoh: Gotong-Royong Taman Rekreasi..."
              placeholderTextColor="#9ca3af"
              value={noticeTitle}
              onChangeText={setNoticeTitle}
              className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
            />

            {/* Category Selector */}
            <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Kategori *</Text>
            <View className="flex-row flex-wrap mb-3">
              {(['Gotong-Royong', 'Penyelenggaraan', 'Keselamatan', 'Aktiviti Komuniti', 'Umum'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNoticeCategory(cat)}
                  className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${
                    noticeCategory === cat ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-100 border-transparent'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${noticeCategory === cat ? 'text-white' : 'text-gray-700'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Keterangan / Butiran Notis *</Text>
            <TextInput
              placeholder="Terangkan secara terperinci mengenai aktiviti, barang yang perlu dibawa, atau makluman keselamatan..."
              placeholderTextColor="#9ca3af"
              value={noticeDesc}
              onChangeText={setNoticeDesc}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900 min-h-[90px]"
            />

            {/* Date & Time */}
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Tarikh (YYYY-MM-DD) *</Text>
                <TextInput
                  placeholder="2026-10-10"
                  placeholderTextColor="#9ca3af"
                  value={noticeDate}
                  onChangeText={setNoticeDate}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Masa</Text>
                <TextInput
                  placeholder="Contoh: 08:30 AM"
                  placeholderTextColor="#9ca3af"
                  value={noticeTime}
                  onChangeText={setNoticeTime}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900"
                />
              </View>
            </View>

            {/* Location */}
            <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Lokasi / Tempat *</Text>
            <TextInput
              placeholder="Contoh: Padang Permainan Blok A"
              placeholderTextColor="#9ca3af"
              value={noticeLocation}
              onChangeText={setNoticeLocation}
              className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-900"
            />

            {/* Organizer & Contact */}
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-700 uppercase mb-1">Penganjur / Nama</Text>
                <TextInput
                  placeholder="Nama Penama"
                  placeholderTextColor="#9ca3af"
                  value={noticeOrganizer}
                  onChangeText={setNoticeOrganizer}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-700 uppercase mb-1">No. Hubungan (Pilihan)</Text>
                <TextInput
                  placeholder="012-3456789"
                  placeholderTextColor="#9ca3af"
                  value={noticeContact}
                  onChangeText={setNoticeContact}
                  keyboardType="phone-pad"
                  className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900"
                />
              </View>
            </View>

            {/* Importance Checkbox */}
            <TouchableOpacity 
              onPress={() => setNoticeImportant(!noticeImportant)}
              className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6"
            >
              <View className={`w-5 h-5 rounded-md border items-center justify-center mr-2.5 ${noticeImportant ? 'bg-rose-600 border-rose-600' : 'bg-white border-gray-300'}`}>
                {noticeImportant && <CheckCircle2 size={14} color="#ffffff" />}
              </View>
              <Text className="text-xs font-semibold text-gray-700 flex-1">
                Tandakan sebagai Notis Penting (Keutamaan Tinggi)
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitNotice}
              disabled={isSubmittingNotice}
              className="w-full bg-emerald-600 py-3.5 rounded-2xl flex-row justify-center items-center shadow-md shadow-emerald-700/30 mb-8 active:scale-95 disabled:opacity-50"
            >
              {isSubmittingNotice ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Hantar untuk Semakan (Submit for Review)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Modal Pengesahan "Submitted to Review" */}
      <Modal visible={submittedReviewVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl border border-gray-100">
            <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3.5 border-2 border-emerald-200">
              <CheckCircle2 size={36} color="#059669" />
            </View>

            <Text className="text-xl font-black text-gray-900 text-center">
              Dihantar untuk Semakan!
            </Text>
            <View className="bg-amber-100 px-3 py-0.5 rounded-full mt-1 mb-2">
              <Text className="text-xs font-bold text-amber-800">Submitted to Review</Text>
            </View>

            <Text className="text-xs text-gray-600 text-center leading-5 mb-5 px-2">
              Notis komuniti anda telah berjaya dihantar ke sistem. Pihak pentadbir (Admin) akan menapis dan meluluskan posting ini di portal pentadbir sebelum ia disiarkan kepada semua jiran.
            </Text>

            <TouchableOpacity
              onPress={() => setSubmittedReviewVisible(false)}
              className="w-full bg-emerald-600 py-3 rounded-xl items-center shadow-sm active:scale-95"
            >
              <Text className="text-white font-bold text-sm">Faham, Terima Kasih</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Selector Modal */}
      <LocationModal 
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />

      {/* Community Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </SafeAreaView>
  );
}
