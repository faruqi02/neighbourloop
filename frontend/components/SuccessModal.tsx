import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Leaf, Award } from 'lucide-react-native';

interface Props {
  visible: boolean;
  points: number;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ visible, points, title, message, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4 border-4 border-green-200">
            <Award size={42} color="#16a34a" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center mb-1">
            {title}
          </Text>

          {points > 0 && (
            <View className="flex-row items-center bg-green-50 px-4 py-2 rounded-full mb-3 border border-green-200">
              <Leaf size={18} color="#16a34a" />
              <Text className="text-green-700 font-bold ml-1.5 text-base">
                +{points} Mata Hijau Diperoleh!
              </Text>
            </View>
          )}

          <Text className="text-gray-600 text-center mb-6 leading-5">
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="w-full bg-green-600 py-3.5 rounded-2xl items-center shadow-md shadow-green-700"
          >
            <Text className="text-white font-bold text-base">Selesai & Teruskan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
