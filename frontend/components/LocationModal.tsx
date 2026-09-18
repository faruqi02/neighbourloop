import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Check, X } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  'Behrang Stesen',
  'Behrang Sentral',
  'Behrang Residen',
  'Behrang 2020',
  'Tanjung Malim',
  'Slim River',
];

const RADIUS_OPTIONS = [2, 5, 10, 20];

export default function LocationModal({ visible, onClose }: Props) {
  const { currentUser, updateLocation } = useUserStore();
  const [selectedLoc, setSelectedLoc] = useState(currentUser.location);
  const [selectedRadius, setSelectedRadius] = useState(currentUser.radiusKm || 5);

  const handleSave = () => {
    updateLocation(selectedLoc, selectedRadius);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <MapPin size={22} color="#16a34a" />
              <Text className="text-xl font-bold text-gray-800 ml-2">Pilih Kawasan & Radius</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Komuniti Kejiranan / Kampus
          </Text>
          <ScrollView className="max-h-48 mb-4">
            {PRESET_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                onPress={() => setSelectedLoc(loc)}
                className={`flex-row items-center justify-between p-3 rounded-xl mb-2 border ${
                  selectedLoc === loc
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedLoc === loc ? 'font-bold text-green-800' : 'text-gray-700'
                  }`}
                >
                  {loc}
                </Text>
                {selectedLoc === loc && <Check size={20} color="#16a34a" />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Radius Carian Komuniti (Jarak)
          </Text>
          <View className="flex-row justify-between mb-6">
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRadius(r)}
                className={`flex-1 mx-1 py-3 rounded-xl border items-center ${
                  selectedRadius === r
                    ? 'bg-green-600 border-green-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`font-bold ${
                    selectedRadius === r ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSave}
            className="bg-green-600 py-4 rounded-2xl items-center shadow-md shadow-green-700"
          >
            <Text className="text-white font-bold text-lg">Simpan & Kemas Kini</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

