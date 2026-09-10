import FilterModal from "@/components/FilterModal";
import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "@/hooks/useSupabase";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import { useFilterStore } from "@/store/filtrerStore";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const supabase = useSupabase();
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  const fetchResults = useCallback(async () => {
    setLoading(true);

    let query = supabase.from("properties").select("*");

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,city.ilike.%${search}%,quartier.ilike.%${search}%`,
      );
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (bedrooms) {
      query = query.eq("bedrooms", bedrooms);
    }

    if (minPrice) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }

    const { data } = await query.order("created_at", { ascending: false });

    setResults(data ?? []);
    setLoading(false);
  }, [supabase, search, type, bedrooms, minPrice, maxPrice]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Rechercher une propriété
        </Text>

        {/* Search Bar + Filter Button */}
        <View className="flex-row items-center gap-3">
          <View
            className="flex-1 flex-row items-center bg-white rounded-2xl px-4 gap-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 py-3 text-gray-800"
              placeholder="Rechercher par titre, ville ou quartier..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              activeFilterCount > 0 ? "bg-blue-600" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? "#fff" : "#374151"}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {type && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Text className="text-blue-700 text-xs font-semibold">
                  {formatPropertyType(type)}
                </Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            )}
            {bedrooms !== null && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Ionicons name="bed-outline" size={11} color="#1D4ED8" />
                <Text className="text-blue-700 text-xs font-semibold">
                  {bedrooms === 4
                    ? "4+ ch."
                    : `${bedrooms} ch.`}
                </Text>
                <TouchableOpacity onPress={() => setBedrooms(null)}>
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Text className="text-blue-700 text-xs font-semibold">
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                    : minPrice
                      ? `À partir de ${formatPrice(minPrice)}`
                      : `Jusqu'à ${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListHeaderComponent={
          <Text className="text-sm text-gray-400 mb-4">
            {loading
              ? "Recherche..."
              : `${results.length} propriété${results.length > 1 ? "s" : ""} trouvée${results.length > 1 ? "s" : ""}`}
          </Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-base">
                Aucune propriété trouvée
              </Text>
              <Text className="text-gray-300 text-sm mt-1">
                Essayez une autre recherche ou ajustez les filtres
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#2563EB" className="py-20" />
          )
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
