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
  'Taman Pelangi, JB',
  'Skudai, Johor Bahru',
  'Taman Universiti, Skudai',
  'Behrang Stesen',
  'Behrang Sentral',
  'Behrang Residen',
  'Behrang 2020',
  'Tanjung Malim',
  'Slim River',
];

const PRESET_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Taman Pelangi, JB': { lat: 1.4815, lng: 103.7712 },
  'Skudai, Johor Bahru': { lat: 1.5366, lng: 103.6599 },
  'Taman Universiti, Skudai': { lat: 1.5366, lng: 103.6599 },
  'Behrang Stesen': { lat: 3.7485, lng: 101.4497 },
  'Behrang Sentral': { lat: 3.7512, lng: 101.4551 },
  'Behrang Residen': { lat: 3.7450, lng: 101.4600 },
  'Behrang 2020': { lat: 3.7400, lng: 101.4420 },
  'Tanjung Malim': { lat: 3.6833, lng: 101.5167 },
  'Slim River': { lat: 3.8333, lng: 101.4000 },
};

const RADIUS_OPTIONS = [2, 5, 10, 20];

export default function LocationModal({ visible, onClose }: Props) {
  const { currentUser, updateLocation } = useUserStore();
  const [selectedLoc, setSelectedLoc] = useState(currentUser?.location || '');
  const [selectedRadius, setSelectedRadius] = useState(currentUser?.radiusKm || 5);
  const [lat, setLat] = useState<number | undefined>(currentUser?.lat);
  const [lng, setLng] = useState<number | undefined>(currentUser?.lng);

  const [detecting, setDetecting] = useState(false);

  React.useEffect(() => {
    if (visible && currentUser) {
      setSelectedLoc(currentUser.location || '');
      setSelectedRadius(currentUser.radiusKm || 5);
      setLat(currentUser.lat);
      setLng(currentUser.lng);
    }
  }, [visible, currentUser]);

  const handleSelectPreset = (loc: string) => {
    setSelectedLoc(loc);
    if (PRESET_COORDINATES[loc]) {
      setLat(PRESET_COORDINATES[loc].lat);
      setLng(PRESET_COORDINATES[loc].lng);
    }
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
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);

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

  const handleSave = async () => {
    let finalLat = lat;
    let finalLng = lng;

    if ((finalLat === undefined || finalLng === undefined) && selectedLoc) {
      if (PRESET_COORDINATES[selectedLoc]) {
        finalLat = PRESET_COORDINATES[selectedLoc].lat;
        finalLng = PRESET_COORDINATES[selectedLoc].lng;
      }
    }

    updateLocation(selectedLoc, selectedRadius, finalLat, finalLng);
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

          {lat && lng ? (
            <View className="mb-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex-row items-center">
              <Check size={14} color="#059669" />
              <Text className="text-xs font-semibold text-emerald-800 ml-1.5">
                Koordinat GPS Aktif: {lat.toFixed(4)}, {lng.toFixed(4)}
              </Text>
            </View>
          ) : null}

          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Komuniti Kejiranan / Kampus
          </Text>
          <ScrollView className="max-h-48 mb-4">
            {PRESET_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                onPress={() => handleSelectPreset(loc)}
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

