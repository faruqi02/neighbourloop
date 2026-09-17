import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock, MapPin, Users, Phone, AlertCircle, Share2 } from 'lucide-react-native';
import { CommunityNotice } from '../types';

interface NoticeDetailModalProps {
  notice: CommunityNotice | null;
  onClose: () => void;
}

export default function NoticeDetailModal({ notice, onClose }: NoticeDetailModalProps) {
  if (!notice) return null;

  const handleCallOrganizer = () => {
    if (!notice.contactPerson) return;
    const phoneMatch = notice.contactPerson.match(/[0-9-]+/);
    if (phoneMatch) {
      Linking.openURL(`tel:${phoneMatch[0]}`);
    }
  };

  return (
    <Modal visible={!!notice} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 py-4 border-b border-gray-200 flex-row justify-between items-center">
          <View className="bg-emerald-100 px-3 py-1 rounded-full">
            <Text className="text-emerald-900 font-bold text-xs">{notice.category}</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {notice.imageUrl ? (
            <Image
              source={{ uri: notice.imageUrl }}
              className="w-full h-48 rounded-2xl mb-4 bg-gray-100 object-cover"
            />
          ) : null}

          <Text className="text-2xl font-black text-gray-900 mb-2 leading-7">
            {notice.title}
          </Text>

          {/* Quick Info Grid */}
          <View className="bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-200">
            <View className="flex-row items-center mb-2.5">
              <Calendar size={16} color="#059669" />
              <Text className="text-xs font-semibold text-gray-700 ml-2">Tarikh: {notice.date}</Text>
            </View>

            {notice.time ? (
              <View className="flex-row items-center mb-2.5">
                <Clock size={16} color="#059669" />
                <Text className="text-xs font-semibold text-gray-700 ml-2">Masa: {notice.time}</Text>
              </View>
            ) : null}

            <View className="flex-row items-center mb-2.5">
              <MapPin size={16} color="#dc2626" />
              <Text className="text-xs font-semibold text-gray-700 ml-2">Lokasi: {notice.location}</Text>
            </View>

            <View className="flex-row items-center">
              <Users size={16} color="#2563eb" />
              <Text className="text-xs font-semibold text-gray-700 ml-2">Penganjur: {notice.organizer}</Text>
            </View>
          </View>

          {/* Notice Description */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">Butiran Hebahan</Text>
          <Text className="text-sm text-gray-800 leading-6 mb-6">
            {notice.description}
          </Text>

          {/* Contact Person Card */}
          {notice.contactPerson ? (
            <View className="bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-200 flex-row justify-between items-center">
              <View className="flex-1 mr-2">
                <Text className="text-[11px] font-bold text-emerald-800 uppercase">Hubungi Untuk Pertanyaan</Text>
                <Text className="text-sm font-bold text-gray-900 mt-0.5">{notice.contactPerson}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCallOrganizer}
                className="bg-emerald-600 px-4 py-2.5 rounded-xl flex-row items-center"
              >
                <Phone size={14} color="white" />
                <Text className="text-white font-bold text-xs ml-1.5">Hubungi</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

