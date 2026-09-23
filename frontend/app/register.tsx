import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { UserPlus, Key, Mail, User, MapPin, Eye, EyeOff, ChevronLeft, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        setLocation(p.district || p.city || p.subregion || p.region || 'Lokasi Semasa');
      }
    } catch (error) {
      alert('Gagal mengesan lokasi.');
    } finally {
      setDetecting(false);
    }
  };
  
  const router = useRouter();
  const { setCurrentUser } = useUserStore();

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password || !location) {
      setError('Sila isi semua maklumat yang diperlukan.');
      return;
    }

    if (password.length < 6) {
      setError('Kata laluan mesti melebihi 6 aksara.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Simulate registration delay for FYP prototype
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Auto login after "registration" (since we don't have a real register endpoint in the mock yet)
      const mockNewUser = {
        id: `usr_${Math.floor(Math.random() * 10000)}`,
        name,
        email,
        phone: '',
        neighborhood: location,
        location,
        radiusKm: 5,
        role: 'Penduduk',
        status: 'Aktif',
      };
      
      setCurrentUser(mockNewUser);
      router.replace('/(tabs)/');
    } catch (err: any) {
      setError('Gagal mendaftar. Sila cuba lagi.');
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
          <View className="mb-8">
            <Text className="text-3xl font-black text-[#1E293B] tracking-tight">Daftar Akaun</Text>
            <Text className="text-slate-500 font-medium mt-2 text-sm leading-5">
              Sertai komuniti NeighbourLoop dan mulakan kelestarian di kawasan kejiranan anda.
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100 flex-row items-center">
              <Text className="text-red-600 text-sm font-semibold flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <View className="space-y-5">
            
            {/* Nama Penuh */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                Nama Penuh
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-14 shadow-sm shadow-slate-100 border ${
                  focusedField === 'name' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'name' ? 2 : 1 }}
              >
                <User size={20} color={focusedField === 'name' ? '#00875A' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-base text-[#1E293B] font-medium h-full outline-none"
                  placeholder="Contoh: Ahmad Ali"
                  placeholderTextColor="#CBD5E1"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Emel */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                Alamat Emel
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-14 shadow-sm shadow-slate-100 border ${
                  focusedField === 'email' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'email' ? 2 : 1 }}
              >
                <Mail size={20} color={focusedField === 'email' ? '#00875A' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-base text-[#1E293B] font-medium h-full outline-none"
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

            {/* Lokasi Kejiranan */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                Kawasan Kejiranan
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-14 shadow-sm shadow-slate-100 border ${
                  focusedField === 'location' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'location' ? 2 : 1 }}
              >
                <MapPin size={20} color={focusedField === 'location' ? '#00875A' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-base text-[#1E293B] font-medium h-full outline-none"
                  placeholder="Contoh: Taman Universiti"
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
                    <ActivityIndicator size="small" color="#00875A" />
                  ) : (
                    <Navigation size={18} color="#00875A" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Kata Laluan */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                Kata Laluan
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-14 shadow-sm shadow-slate-100 border ${
                  focusedField === 'password' ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: focusedField === 'password' ? 2 : 1 }}
              >
                <Key size={20} color={focusedField === 'password' ? '#00875A' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-base text-[#1E293B] font-medium h-full outline-none"
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
                    <EyeOff size={20} color={focusedField === 'password' ? '#00875A' : '#94A3B8'} />
                  ) : (
                    <Eye size={20} color={focusedField === 'password' ? '#00875A' : '#94A3B8'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading || !isFormValid}
            className={`w-full h-14 rounded-xl items-center flex-row justify-center mt-10 shadow-md ${
              loading || !isFormValid
                ? 'bg-emerald-100 shadow-transparent'
                : 'shadow-emerald-900/20'
            }`}
            style={{ backgroundColor: loading || !isFormValid ? '#E2E8F0' : '#00875A' }}
          >
            {loading ? (
              <ActivityIndicator color="#00875A" />
            ) : (
              <>
                <UserPlus size={20} color={loading || !isFormValid ? '#94A3B8' : 'white'} />
                <Text
                  className={`font-bold text-base ml-2 ${
                    loading || !isFormValid ? 'text-slate-400' : 'text-white'
                  }`}
                >
                  Daftar Akaun
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bottom Login Prompt */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-500 font-medium text-sm">Sudah mempunyai akaun? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="font-bold text-sm" style={{ color: '#00875A' }}>Log Masuk</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

