import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Phone, MessageSquare, Send, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { User } from '../types';

interface EditContactModalProps {
  visible: boolean;
  onClose: () => void;
}

const CONTACT_METHODS: Array<User['preferredContactMethod']> = [
  'Semua',
  'WhatsApp',
  'Chat Aplikasi',
  'Telegram',
  'Panggilan',
];

export default function EditContactModal({ visible, onClose }: EditContactModalProps) {
  const { currentUser, updateContactDetails } = useUserStore();

  const [phone, setPhone] = useState(currentUser.phone || '');
  const [telegram, setTelegram] = useState(currentUser.telegram || '');
  const [contactNotes, setContactNotes] = useState(currentUser.contactNotes || '');
  const [preferredMethod, setPreferredMethod] = useState<User['preferredContactMethod']>(
    currentUser.preferredContactMethod || 'WhatsApp'
  );

  const handleSave = () => {
    updateContactDetails(phone, telegram, contactNotes, preferredMethod);
    Alert.alert('Berjaya Disimpan', 'Maklumat perhubungan anda telah dikemaskini.');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 py-4 border-b border-gray-200 flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-xl font-black text-gray-900">Maklumat Perhubungan</Text>
            <Text className="text-xs text-gray-400">Pilihan cara jiran boleh menghubungi anda</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-4 bg-gray-50" showsVerticalScrollIndicator={false}>
          {/* Privacy Notice Banner */}
          <View className="bg-blue-50 p-3.5 rounded-2xl mb-4 border border-blue-200 flex-row items-start">
            <ShieldCheck size={20} color="#2563eb" className="mr-2 mt-0.5" />
            <Text className="text-xs text-blue-800 leading-4 flex-1">
              Maklumat ini adalah <Text className="font-bold">sukarela</Text>. Anda bebas memilih sama ada ingin berkongsi nombor WhatsApp atau berhubung melalui sembang aplikasi sahaja.
            </Text>
          </View>

          {/* Phone Number Field */}
          <Text className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
            No. Telefon / WhatsApp (Pilihan)
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

          {/* Telegram Handle */}
          <Text className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
            ID Telegram (Pilihan)
          </Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
            <Send size={18} color="#0284c7" />
            <TextInput
              placeholder="Contoh: @jiran_jb"
              placeholderTextColor="#9ca3af"
              value={telegram}
              onChangeText={setTelegram}
              className="flex-1 ml-2.5 text-sm text-gray-900"
            />
          </View>

          {/* Preferred Contact Method */}
          <Text className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
            Kaedah Perhubungan Paling Digemari
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {CONTACT_METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setPreferredMethod(m)}
                className={`mr-2 mb-2 px-3.5 py-2 rounded-xl border ${
                  preferredMethod === m
                    ? 'bg-green-700 border-green-700 shadow-sm'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    preferredMethod === m ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Notes */}
          <Text className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
            Waktu Sesuai / Catatan Tambahan
          </Text>
          <TextInput
            placeholder="Contoh: WhatsApp waktu petang sahaja. Sila mesej sebelum datang mengambil barang."
            placeholderTextColor="#9ca3af"
            value={contactNotes}
            onChangeText={setContactNotes}
            multiline
            numberOfLines={3}
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 mb-6 text-sm text-gray-900 shadow-sm"
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="w-full bg-green-700 py-4 rounded-2xl items-center shadow-md shadow-green-700/30 flex-row justify-center mb-8"
          >
            <CheckCircle2 size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Simpan Maklumat Perhubungan</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

