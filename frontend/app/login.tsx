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
import { LogIn, Key, Mail, Recycle, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const router = useRouter();
  const { setCurrentUser } = useUserStore();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://192.168.68.178:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const fallbackRes = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        
        if (!fallbackRes.ok) {
           const errData = await fallbackRes.json().catch(() => ({}));
           throw new Error(errData.detail || 'Sila semak semula email & kata laluan anda.');
        }
        
        const userData = await fallbackRes.json();
        setCurrentUser(userData);
        router.replace('/(tabs)/');
        return;
      }

      const userData = await response.json();
      setCurrentUser(userData);
      router.replace('/(tabs)/');
    } catch (err: any) {
      setError(err.message || 'Gagal menyambung ke pelayan (server).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
            
          {/* Branding Area */}
          <View className="items-center mb-12">
            <View 
              className="w-24 h-24 rounded-full items-center justify-center mb-5 shadow-lg shadow-black/10"
              style={{ backgroundColor: '#00875A' }}
            >
              <Recycle size={48} color="white" />
            </View>
            <Text className="text-3xl font-black text-[#1E293B] tracking-tight">NeighbourLoop</Text>
            <Text className="text-slate-500 font-medium mt-2 text-sm tracking-wide">Sistem Komuniti Lestari Pintar</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100 flex-row items-center">
              <Text className="text-red-600 text-sm font-semibold flex-1 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <View className="space-y-5">
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                Emel atau No. Telefon
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-14 shadow-sm shadow-slate-100 border ${
                  isEmailFocused ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: isEmailFocused ? 2 : 1 }}
              >
                <Mail size={20} color={isEmailFocused ? '#00875A' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-base text-[#1E293B] font-medium h-full outline-none"
                  placeholder="admin@neighbourloop.com"
                  placeholderTextColor="#CBD5E1"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            <View className="mt-5">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                Kata Laluan
              </Text>
              <View 
                className={`flex-row items-center bg-white rounded-xl px-4 h-14 shadow-sm shadow-slate-100 border ${
                  isPasswordFocused ? 'border-emerald-600' : 'border-slate-200'
                }`}
                style={{ borderWidth: isPasswordFocused ? 2 : 1 }}
              >
                <Key size={20} color={isPasswordFocused ? '#00875A' : '#94A3B8'} />
                <TextInput
                  className="flex-1 px-3 text-base text-[#1E293B] font-medium h-full outline-none"
                  placeholder="Masukkan kata laluan..."
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? (
                    <EyeOff size={20} color={isPasswordFocused ? '#00875A' : '#94A3B8'} />
                  ) : (
                    <Eye size={20} color={isPasswordFocused ? '#00875A' : '#94A3B8'} />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity className="self-end mt-2">
                <Text className="text-sm font-semibold" style={{ color: '#00875A' }}>Lupa Kata Laluan?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !identifier || !password}
            className={`w-full h-14 rounded-xl items-center flex-row justify-center mt-10 shadow-md ${
              loading || !identifier || !password
                ? 'bg-emerald-100 shadow-transparent'
                : 'shadow-emerald-900/20'
            }`}
            style={{ backgroundColor: loading || !identifier || !password ? '#E2E8F0' : '#00875A' }}
          >
            {loading ? (
              <ActivityIndicator color="#00875A" />
            ) : (
              <>
                <LogIn size={20} color={loading || !identifier || !password ? '#94A3B8' : 'white'} />
                <Text
                  className={`font-bold text-base ml-2 ${
                    loading || !identifier || !password ? 'text-slate-400' : 'text-white'
                  }`}
                >
                  Log Masuk Sistem
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bottom Registration Prompt */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-500 font-medium text-sm">Belum mempunyai akaun? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="font-bold text-sm" style={{ color: '#00875A' }}>Daftar di sini</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

