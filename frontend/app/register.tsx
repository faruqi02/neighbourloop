import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { getApiBaseUrl } from '../services/api';
import { 
  Key, 
  Mail, 
  User, 
  MapPin, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  Navigation,
  Phone,
  AtSign
} from 'lucide-react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const { setCurrentUser } = useUserStore();

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Keizinan lokasi diperlukan untuk mengesan kawasan anda.');
        setDetecting(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);

      let geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode && geocode.length > 0) {
        const p = geocode[0];
        setLocation(p.district || p.city || p.subregion || p.region || 'Lokasi Semasa');
      }
    } catch (error) {
      alert('Gagal mengesan lokasi.');
    } finally {
      setDetecting(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !location) {
      setError('Sila isi semua maklumat mandatori (Nama, Emel, Kata Laluan, Lokasi).');
      return;
    }

    if (password.length < 6) {
      setError('Kata laluan mesti sekurang-kurangnya 6 aksara.');
      return;
    }

    setError('');
    setLoading(true);

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
            // Geocoding fallback
          }
        }
      }

      const backendUrl = getApiBaseUrl();

      const payload = {
        name: name.trim(),
        username: username.trim().replace(/^@/, '') || (email.split('@')[0] || name.trim().toLowerCase().replace(/\s+/g, '_')),
        email: email.trim(),
        phone: phone.trim(),
        password,
        location: location.trim(),
        lat: finalLat,
        lng: finalLng,
      };

      let response: Response;
      try {
        response = await fetch(`${backendUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // Fallback to localhost
        response = await fetch('http://127.0.0.1:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Pendaftaran gagal. Sila cuba lagi.');
      }

      const userData = await response.json();
      setCurrentUser(userData);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar ke pangkalan data.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name && email && password && location;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 24, paddingBottom: 40, flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100 mb-6"
          >
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>

          {/* Header Area */}
          <View className="mb-6 flex-row items-center gap-3.5">
            <Image 
              source={require('../images/logo.png')} 
              style={{ width: 56, height: 56, borderRadius: 16 }}
              className="w-14 h-14 rounded-2xl shadow-sm"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-2xl font-black text-[#1E293B] tracking-tight">Daftar Akaun</Text>
              <Text className="text-slate-500 font-medium text-xs leading-4 mt-0.5">
                Sertai komuniti NeighbourLoop dan mulakan kelestarian di kejiranan anda.
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100 flex-row items-center">
              <Text className="text-red-600 text-sm font-semibold flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <View className="space-y-4">
            {/* Nama Penuh */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">
                Nama Penuh *
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-13 shadow-sm shadow-slate-100 border ${
                  focusedField === 'name' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'name' ? 2 : 1 }}
              >
                <User size={18} color={focusedField === 'name' ? '#059669' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-sm text-[#1E293B] font-medium h-full"
                  placeholder="Contoh: Ahmad Ali"
                  placeholderTextColor="#CBD5E1"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Nama Pengguna (Username) */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">
                Nama Pengguna (Username)
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-13 shadow-sm shadow-slate-100 border ${
                  focusedField === 'username' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'username' ? 2 : 1 }}
              >
                <AtSign size={18} color={focusedField === 'username' ? '#059669' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-sm text-[#1E293B] font-medium h-full"
                  placeholder="Contoh: ahmad_ali"
                  placeholderTextColor="#CBD5E1"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Emel */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">
                Alamat Emel *
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-13 shadow-sm shadow-slate-100 border ${
                  focusedField === 'email' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'email' ? 2 : 1 }}
              >
                <Mail size={18} color={focusedField === 'email' ? '#059669' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-sm text-[#1E293B] font-medium h-full"
                  placeholder="ahmad@gmail.com"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* No. Telefon / WhatsApp */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">
                No Telefon / WhatsApp
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-13 shadow-sm shadow-slate-100 border ${
                  focusedField === 'phone' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'phone' ? 2 : 1 }}
              >
                <Phone size={18} color={focusedField === 'phone' ? '#059669' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-sm text-[#1E293B] font-medium h-full"
                  placeholder="Contoh: 012-3456789"
                  placeholderTextColor="#CBD5E1"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Lokasi Kejiranan */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">
                Kawasan Kejiranan *
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-13 shadow-sm shadow-slate-100 border ${
                  focusedField === 'location' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'location' ? 2 : 1 }}
              >
                <MapPin size={18} color={focusedField === 'location' ? '#059669' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-sm text-[#1E293B] font-medium h-full"
                  placeholder="Contoh: Taman Universiti, JB"
                  placeholderTextColor="#CBD5E1"
                  value={location}
                  onChangeText={setLocation}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  onPress={handleDetectLocation}
                  className="p-2 bg-emerald-50 rounded-lg"
                >
                  {detecting ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Navigation size={18} color="#059669" />
                  )}
                </TouchableOpacity>
              </View>
              {lat && lng ? (
                <Text className="text-[11px] text-emerald-600 font-semibold mt-1 ml-1">
                  GPS dikesan: {lat.toFixed(4)}, {lng.toFixed(4)}
                </Text>
              ) : null}
            </View>

            {/* Kata Laluan */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">
                Kata Laluan *
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-13 shadow-sm shadow-slate-100 border ${
                  focusedField === 'password' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'password' ? 2 : 1 }}
              >
                <Key size={18} color={focusedField === 'password' ? '#059669' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-sm text-[#1E293B] font-medium h-full"
                  placeholder="Minimum 6 aksara..."
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? (
                    <EyeOff size={18} color={focusedField === 'password' ? '#059669' : '#94A3B8'} />
                  ) : (
                    <Eye size={18} color={focusedField === 'password' ? '#059669' : '#94A3B8'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading || !isFormValid}
            className={`w-full h-14 rounded-2xl items-center justify-center mt-8 shadow-md ${
              isFormValid && !loading 
                ? 'bg-emerald-600 shadow-emerald-900/20' 
                : 'bg-slate-300 shadow-none'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">Daftar Sekarang</Text>
            )}
          </TouchableOpacity>

          {/* Login Redirection */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500 text-sm font-medium">Sudah mempunyai akaun? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text className="text-emerald-700 font-bold text-sm">Log Masuk</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
