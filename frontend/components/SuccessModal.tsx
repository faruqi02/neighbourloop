import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  points?: number; // kept optional for backward compatibility
}

export default function SuccessModal({ visible, title, message, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
          <View className="w-18 h-18 rounded-full bg-green-100 items-center justify-center mb-4 border-4 border-green-200" style={{ width: 72, height: 72, borderRadius: 36 }}>
            <CheckCircle2 size={40} color="#16a34a" />
          </View>

          <Text className="text-xl font-black text-gray-900 text-center mb-2">
            {title}
          </Text>

          <Text className="text-gray-600 text-center mb-6 leading-5 text-sm">
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="w-full bg-green-700 py-3.5 rounded-2xl items-center shadow-md shadow-green-700/30"
          >
            <Text className="text-white font-bold text-base">Selesai & Teruskan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
