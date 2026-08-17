import { supabase } from "@/lib/supabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperies = async () => {
    setLoading(true);
    const { data: featuredData, error: featuredError } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    const { data: recommendedData, error: recommendedError } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", false)
      .order("created_at", { ascending: false });

    if (featuredError) console.error("Featured error:", featuredError);
    if (recommendedError) console.error("Recommended error:", recommendedError);

    console.log("Featured:", featuredData);
    console.log("Recommended:", recommendedData);

    setFeatured(featuredData ?? []);
    setRecommended(recommendedData ?? []);
    setLoading(false);
  };
  //pour reperer
  useFocusEffect(
    useCallback(() => {
      fetchProperies();
    }, []),
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

            {/* search bar*/}

            {/* featured section*/}

            {/* Recommended header*/}
            <Text className="text-gray-900 text-lg font-bold px-5 mb">
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <Text>{item.title}</Text>
          </View>
        )}
      />
      <View>
        <Text>HomeScreen</Text>
      </View>
    </SafeAreaView>
  );
}
