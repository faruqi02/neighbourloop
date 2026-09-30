import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Phone, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Key, 
  Eye, 
  EyeOff, 
  Camera, 
  Image as ImageIcon, 
  Navigation, 
  AtSign, 
  CheckCircle2 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useUserStore } from '../store/useUserStore';

interface EditContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditContactModal({ visible, onClose }: EditContactModalProps) {
  const { currentUser, updateProfile } = useUserStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state with currentUser whenever modal opens
  useEffect(() => {
    if (visible && currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : ''));
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setLocation(currentUser.location || '');
      setLat(currentUser.lat);
      setLng(currentUser.lng);
      setAvatarUrl(currentUser.avatarUrl || '');
      setAvatarBase64(null);
      setNewPassword('');
    }
  }, [visible, currentUser]);

  // Pick image from phone gallery
  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Kebenaran Diperlukan', 'Sila berikan akses galeri foto untuk menukar gambar profil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUrl(asset.uri);
        if (asset.base64) {
          setAvatarBase64(asset.base64);
        }
      }
    } catch (error) {
      Alert.alert('Ralat', 'Tidak dapat membuka galeri foto.');
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Kebenaran Diperlukan', 'Sila berikan kebenaran kamera untuk mengambil gambar.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUrl(asset.uri);
        if (asset.base64) {
          setAvatarBase64(asset.base64);
        }
      }
    } catch (error) {
      Alert.alert('Ralat', 'Tidak dapat menggunakan kamera.');
    }
  };

  // Detect GPS Location
  const handleDetectGPS = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Keizinan Diperlukan', 'Sila benarkan akses lokasi GPS peranti anda.');
        setDetectingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = loc.coords.latitude;
      const longitude = loc.coords.longitude;
      setLat(latitude);
      setLng(longitude);

      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode.length > 0) {
          const p = geocode[0];
          const detectedName = p.district || p.city || p.subregion || p.region || 'Lokasi Semasa';
          setLocation(detectedName);
        }
      } catch (geoErr) {
        console.warn('Geocoding error:', geoErr);
      }

      Alert.alert(
        'GPS Dikesan!',
        `Koordinat berjaya dikesan:\nLat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
      );
    } catch (error) {
      Alert.alert('Ralat Lokasi', 'Gagal mengesan lokasi GPS peranti.');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ralat', 'Sila masukkan nama penuh anda.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Ralat', 'Sila masukkan alamat emel anda.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Ralat', 'Sila masukkan kawasan kejiranan / lokasi anda.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert('Ralat', 'Kata laluan baru mesti mempunyai sekurang-kurangnya 6 aksara.');
      return;
    }

    setSaving(true);
    try {
      let finalLat = lat;
      let finalLng = lng;

      if (finalLat === undefined || finalLng === undefined) {
        const PRESET_COORDINATES: Record<string, { lat: number; lng: number }> = {
          'behrang stesen': { lat: 3.7485, lng: 101.4497 },
          'behrang sentral': { lat: 3.7512, lng: 101.4551 },
          'behrang residen': { lat: 3.7450, lng: 101.4600 },
          'behrang 2020': { lat: 3.7400, lng: 101.4420 },
          'tanjung malim': { lat: 3.6833, lng: 101.5167 },
          'slim river': { lat: 3.8333, lng: 101.4000 },
          'iskandar puteri': { lat: 1.4889, lng: 103.6525 },
          'skudai': { lat: 1.5350, lng: 103.6330 },
          'taman universiti': { lat: 1.5300, lng: 103.6280 },
        };
        const locKey = location.trim().toLowerCase();
        if (PRESET_COORDINATES[locKey]) {
          finalLat = PRESET_COORDINATES[locKey].lat;
          finalLng = PRESET_COORDINATES[locKey].lng;
        } else {
          try {
            const geocoded = await Location.geocodeAsync(location.trim());
            if (geocoded && geocoded.length > 0) {
              finalLat = geocoded[0].latitude;
              finalLng = geocoded[0].longitude;
            }
          } catch (e) {
            // Geocoding fallback ignored
          }
        }
      }

      const result = await updateProfile({
        name: name.trim(),
        username: username.trim().replace(/^@/, ''),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        lat: finalLat,
        lng: finalLng,
        avatarUrl: avatarUrl.trim(),
        avatarBase64: avatarBase64 || undefined,
        newPassword: newPassword.trim() || undefined,
      });

      Alert.alert('Berjaya Disimpan', 'Maklumat profil anda telah berjaya dikemaskini dalam pangkalan data.');
      onClose();
    } catch (error) {
      Alert.alert('Ralat', 'Gagal menyimpan kemaskini profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 py-4 border-b border-gray-200 flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-xl font-black text-gray-900">Kemaskini Profil</Text>
            <Text className="text-xs text-gray-500">Edit nama, emel, lokasi GPS, foto & kata laluan</Text>
          </View>
          <TouchableOpacity 
            onPress={onClose} 
            className="p-2 bg-gray-100 rounded-full"
            disabled={saving}
          >
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView className="flex-1 px-5 pt-4 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* Avatar Photo Section */}
            <View className="bg-white p-4 rounded-2xl border border-gray-200 mb-4 items-center shadow-sm">
              <Text className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                Foto Profil Pengguna
              </Text>
              
              <View className="relative mb-3">
                <Image
                  source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || currentUser?.name || 'Pengguna')}&background=059669&color=fff&size=250` }}
                  className="w-24 h-24 rounded-full bg-gray-100 border-4 border-emerald-500"
                />
                <TouchableOpacity 
                  onPress={handlePickFromGallery}
                  className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full border-2 border-white shadow-md"
                >
                  <Camera size={14} color="white" />
                </TouchableOpacity>
              </View>

              {/* Photo Source Buttons */}
              <View className="flex-row w-full justify-center space-x-2">
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  className="flex-1 bg-emerald-50 border border-emerald-300 py-2.5 px-3 rounded-xl flex-row items-center justify-center mr-1.5"
                >
                  <ImageIcon size={16} color="#059669" />
                  <Text className="text-emerald-800 font-bold text-xs ml-1.5">Pilih Galeri</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className="flex-1 bg-gray-100 border border-gray-300 py-2.5 px-3 rounded-xl flex-row items-center justify-center ml-1.5"
                >
                  <Camera size={16} color="#374151" />
                  <Text className="text-gray-700 font-bold text-xs ml-1.5">Ambil Foto</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nama Penuh Field */}
            <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Nama Penuh <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
              <UserIcon size={18} color="#059669" />
              <TextInput
                placeholder="Contoh: Siti Aisyah"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
              />
            </View>

            {/* Nama Pengguna (Username) Field */}
            <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Nama Pengguna (Username)
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
              <AtSign size={18} color="#059669" />
              <TextInput
                placeholder="Contoh: aisyah_jb"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
              />
            </View>

            {/* Email Field */}
            <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Alamat Emel <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
              <Mail size={18} color="#059669" />
              <TextInput
                placeholder="Contoh: aisyah@gmail.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
              />
            </View>

            {/* Phone Number Field */}
            <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase">
              No. Telefon / WhatsApp
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-4 shadow-sm">
              <Phone size={18} color="#059669" />
              <TextInput
                placeholder="Contoh: 012-3456789"
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
              />
            </View>

            {/* Location & GPS Detection Field */}
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-xs font-bold text-gray-700 uppercase">
                Kawasan Kejiranan (Lokasi) <Text className="text-red-500">*</Text>
              </Text>
              {lat && lng ? (
                <View className="flex-row items-center bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} color="#059669" />
                  <Text className="text-[10px] font-bold text-emerald-800 ml-1">
                    GPS Aktif ({lat.toFixed(4)}, {lng.toFixed(4)})
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center bg-amber-100 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-amber-800">
                    GPS Belum Dikesan
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-2 shadow-sm">
              <MapPin size={18} color="#059669" />
              <TextInput
                placeholder="Contoh: Taman Universiti, Skudai"
                placeholderTextColor="#9ca3af"
                value={location}
                onChangeText={setLocation}
                className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
              />
            </View>

            {/* GPS Detection Button */}
            <TouchableOpacity
              onPress={handleDetectGPS}
              disabled={detectingLocation}
              className="flex-row items-center justify-center bg-emerald-50 border border-emerald-300 py-2.5 px-4 rounded-xl mb-4"
            >
              {detectingLocation ? (
                <>
                  <ActivityIndicator size="small" color="#059669" />
                  <Text className="text-xs font-bold text-emerald-800 ml-2">Mengesan GPS Peranti...</Text>
                </>
              ) : (
                <>
                  <Navigation size={15} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-800 ml-1.5">
                    {lat && lng ? 'Kemas Kini Koordinat GPS Semasa' : 'Kesan Koordinat GPS Sekarang'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* New Password Field */}
            <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Kata Laluan Baru (Pilihan)
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 mb-1 shadow-sm">
              <Key size={18} color="#059669" />
              <TextInput
                placeholder="Biarkan kosong jika tidak tukar"
                placeholderTextColor="#9ca3af"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
              </TouchableOpacity>
            </View>
            <Text className="text-[11px] text-gray-400 mb-5 ml-1">
              Hanya isi jika anda ingin mengemas kini kata laluan (sekurang-kurangnya 6 aksara).
            </Text>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-2xl items-center justify-center mb-10 shadow-sm ${
                saving ? 'bg-emerald-400' : 'bg-emerald-600'
              }`}
            >
              {saving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-bold text-base ml-2">Menyimpan ke Pangkalan Data...</Text>
                </View>
              ) : (
                <Text className="text-white font-black text-base">Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
