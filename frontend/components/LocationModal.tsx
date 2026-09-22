import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MapPin, Check, X, Navigation } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import * as Location from 'expo-location';
import { apiRequest } from '../services/api';

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

  const [detecting, setDetecting] = useState(false);

  const handleSave = async () => {
    updateLocation(selectedLoc, selectedRadius);
    
    if (currentUser?.id) {
      try {
        await apiRequest(`/admin/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ neighborhood: selectedLoc })
        });
      } catch(e) {
        console.error('Failed to save location', e);
      }
    }
    onClose();
  };

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Keizinan lokasi diperlukan.');
        setDetecting(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      if (geocode && geocode.length > 0) {
        const p = geocode[0];
        setSelectedLoc(p.district || p.city || p.subregion || p.region || 'Lokasi Semasa');
      }
    } catch (error) {
      alert('Gagal mengesan lokasi.');
    } finally {
      setDetecting(false);
    }
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

          <TouchableOpacity 
            onPress={handleDetectLocation}
            className="flex-row items-center justify-center bg-green-100 p-3 rounded-xl mb-4 border border-green-200"
          >
            {detecting ? (
              <ActivityIndicator color="#16a34a" size="small" />
            ) : (
              <>
                <Navigation size={18} color="#16a34a" />
                <Text className="ml-2 font-bold text-green-700">Kesan Lokasi Semasa (GPS)</Text>
              </>
            )}
          </TouchableOpacity>

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

