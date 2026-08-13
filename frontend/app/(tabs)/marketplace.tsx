import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import { useMarketStore } from '../../store/useMarketStore';

const categories = ['Semua', 'Perabot', 'Elektronik', 'Pakaian'];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const { filterByCategory } = useMarketStore();
  
  const listings = filterByCategory(selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Marketplace</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <Search size={20} color="#9ca3af" />
          <TextInput 
            placeholder="Cari barang..."
            className="flex-1 ml-2 text-base text-gray-800"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-3 px-5 py-2 rounded-full border ${selectedCategory === cat ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`${selectedCategory === cat ? 'text-white' : 'text-gray-600'} font-semibold`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings */}
      <ScrollView className="px-5 flex-1">
        {listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).map((item) => (
          <View key={item.id} className="flex-row bg-white rounded-2xl p-3 mb-4 border border-gray-100 shadow-sm shadow-gray-200">
            <Image 
              source={{ uri: item.imageUrl }} 
              className="w-24 h-24 rounded-xl bg-gray-200"
            />
            <View className="flex-1 ml-4 justify-center">
              <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
              <Text className="text-gray-500 text-sm mb-1">{item.description}</Text>
              <Text className="text-green-700 font-bold text-lg">RM {item.price}</Text>
            </View>
            <View className="justify-end">
              <Text className="text-gray-400 text-xs">{item.distance} km</Text>
            </View>
          </View>
        ))}
        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 left-1/2 -ml-8 w-16 h-16 bg-green-600 rounded-full items-center justify-center shadow-lg shadow-green-700">
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
