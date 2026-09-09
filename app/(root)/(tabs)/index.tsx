import FeaturedCard from "@/components/featuredCard";
import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useSupabase();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasLoadedRef = React.useRef(false);

  const fetchProperties = useCallback(async () => {
    if (!hasLoadedRef.current) setInitialLoading(true);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Properties error:", error);
      setInitialLoading(false);
      return;
    }

    const properties = data ?? [];
    setFeatured(properties.filter((property) => property.is_featured === true));
    setRecommended(
      properties.filter((property) => property.is_featured !== true),
    );
    hasLoadedRef.current = true;
    setInitialLoading(false);
  }, [supabase]);

  useFocusEffect(
    useCallback(() => {
      void fetchProperties();
    }, [fetchProperties]),
  );

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* header*/}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={require("../../../assets/images/logo.png")}
                style={{ width: 90, height: 36 }}
                resizeMode="contain"
              />
              <View className="items-end">
                <Text>Bonjour</Text>
                <Text className="text-gray-900 text-base font-bold">
                  {user?.firstName ?? "Utilisateur"}
                </Text>
              </View>
            </View>

            {/* search bar*/}
            <View
              className="mx-5 mb-6 flex-row items-center bg-white rounded-2xl px-4 py-3 gap-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                className="flex-1 flex-row items-center gap-3"
              >
                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm flex-1">
                  Rechercher propriétés, villes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                className="w-8 h-8 bg-blue-600 rounded-xl items-center justify-center "
              >
                <Ionicons name="options-outline" size={15} color="white" />
              </TouchableOpacity>
            </View>

            {/* featured section*/}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-bold px-5 mb-4">
                En vedette
              </Text>
              {initialLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                  className="py-10"
                />
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  ListEmptyComponent={
                    <Text className="text-gray-400 px-5">
                      Aucune propriété en vedette
                    </Text>
                  }
                />
              )}
            </View>
            {/* Recommended header*/}
            <Text className="text-gray-900 text-lg font-bold px-5 mb-4">
              Recommandées
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !initialLoading ? (
            <View className="items-center py-10">
              <Text className="text-gray-400 ">
                Aucune propriété trouvée
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
