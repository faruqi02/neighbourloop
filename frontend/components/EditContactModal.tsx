import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Phone, User as UserIcon, ShieldCheck } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';

interface EditContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditContactModal({ visible, onClose }: EditContactModalProps) {
  const { currentUser, updateContactDetails } = useUserStore();

  const [username, setUsername] = useState(currentUser?.username || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const handleSave = () => {
    updateContactDetails(phone.trim() || undefined, username.trim() || undefined);
    Alert.alert('Berjaya Disimpan', 'Maklumat profil anda telah dikemaskini.');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 py-4 border-b border-gray-200 flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-xl font-black text-gray-900">Kemaskini Profil</Text>
            <Text className="text-xs text-gray-400">Kemaskini nama pengguna dan nombor telefon anda</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-4 bg-gray-50" showsVerticalScrollIndicator={false}>
          {/* Privacy Notice Banner */}
          <View className="bg-emerald-50 p-3.5 rounded-2xl mb-4 border border-emerald-200 flex-row items-start">
            <ShieldCheck size={20} color="#059669" className="mr-2 mt-0.5" />
            <Text className="text-xs text-emerald-800 leading-4 flex-1">
              Nama pengguna anda akan dipaparkan di profil dan barangan yang anda kongsi. Nombor telefon memudahkan jiran berhubung terus melalui WhatsApp.
            </Text>
          </View>

          {/* Username Field */}
          <Text className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
            Nama Pengguna (Username)
          </Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
            <UserIcon size={18} color="#059669" />
            <TextInput
              placeholder="Contoh: aisyah_jb"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              className="flex-1 ml-2.5 text-sm text-gray-900 font-semibold"
            />
          </View>

          {/* Phone Number Field */}
          <Text className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
            No. Telefon / WhatsApp
          </Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
            <Phone size={18} color="#16a34a" />
            <TextInput
              placeholder="Contoh: 012-3456789"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="flex-1 ml-2.5 text-sm text-gray-900 font-semibold"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="w-full bg-emerald-600 py-3.5 rounded-2xl items-center justify-center mt-4 shadow-sm shadow-emerald-900/20"
          >
            <Text className="text-white font-bold text-base">Simpan Perubahan</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
