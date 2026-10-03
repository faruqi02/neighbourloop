import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, ScrollView, Alert, Platform } from 'react-native';
import { Camera, Image as ImageIcon, X, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerButtonProps {
  selectedImageUri: string;
  onImageSelected: (uri: string, base64?: string) => void;
  presetImages?: string[];
  title?: string;
}

const DEFAULT_PRESETS = [
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=400',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
];

export default function ImagePickerButton({
  selectedImageUri,
  onImageSelected,
  presetImages = DEFAULT_PRESETS,
  title = 'Gambar Barangan / Aktiviti',
}: ImagePickerButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      setLoading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Kebenaran Diperlukan', 'Sila benarkan akses galeri foto untuk memuat naik gambar.');
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined);
      }
    } catch (error) {
      console.warn('Error picking image:', error);
      Alert.alert('Ralat', 'Tidak dapat membuka galeri foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Kebenaran Diperlukan', 'Sila benarkan akses kamera untuk mengambil gambar.');
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined);
      }
    } catch (error) {
      console.warn('Error taking photo:', error);
      Alert.alert('Ralat', 'Tidak dapat menggunakan kamera.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase">{title}</Text>

      {/* Selected Image Preview */}
      {selectedImageUri ? (
        <View className="relative rounded-2xl overflow-hidden mb-3 border-2 border-green-500 bg-gray-100">
          <Image source={{ uri: selectedImageUri }} className="w-full h-44 object-cover" />
          <TouchableOpacity
            onPress={() => onImageSelected('')}
            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"
          >
            <X size={16} color="white" />
          </TouchableOpacity>
          <View className="absolute bottom-2 left-2 bg-black/60 px-2.5 py-1 rounded-full">
            <Text className="text-white text-[11px] font-semibold">Gambar Dipilih</Text>
          </View>
        </View>
      ) : null}

      {/* Action Buttons for Gallery / Camera */}
      <View className="flex-row mb-3">
        <TouchableOpacity
          onPress={handlePickFromGallery}
          className="flex-1 bg-green-50 border border-green-300 py-2.5 px-3 rounded-xl flex-row items-center justify-center mr-2"
        >
          <ImageIcon size={18} color="#16a34a" />
          <Text className="text-green-800 font-bold text-xs ml-1.5">Pilih Dari Galeri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTakePhoto}
          className="flex-1 bg-gray-100 border border-gray-300 py-2.5 px-3 rounded-xl flex-row items-center justify-center ml-2"
        >
          <Camera size={18} color="#4b5563" />
          <Text className="text-gray-700 font-bold text-xs ml-1.5">Ambil Foto</Text>
        </TouchableOpacity>
      </View>

      {/* Preset Quick Select Options */}
      <Text className="text-[11px] font-semibold text-gray-400 mb-1.5">Atau pilih contoh gambar:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {presetImages.map((img, i) => {
          const isSelected = selectedImageUri === img;
          return (
            <Pressable
              key={i}
              onPress={() => onImageSelected(img)}
              style={({ pressed }) => ({
                marginRight: 10,
                borderRadius: 14,
                borderWidth: 2.5,
                borderColor: isSelected ? '#16a34a' : 'transparent',
                overflow: 'hidden',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Image source={{ uri: img }} style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#f3f4f6' }} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

