import { useSavedProperty } from "@/hooks/useSavedProperty";
import { useSupabase } from "@/hooks/useSupabase";
import {
  formatPrice,
  formatPriceInWords,
  formatPropertyType,
} from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "");
  const authSupabase = useSupabase();

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const { width } = Dimensions.get("window");
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const fetchProperty = async () => {
    const { data } = await authSupabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    setProperty(data);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert("Supprimer la propriété", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const { error } = await authSupabase
            .from("properties")
            .delete()
            .eq("id", id);
          if (error) {
            console.error("Delete property error:", error);
            Alert.alert("Suppression impossible", error.message);
            return;
          }
          router.replace("/(root)/(tabs)");
          Alert.alert("Supprimée", "La propriété a été supprimée.");
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/(root)/property/edit/${id}`);
  };

  const handleMarkSold = () => {
    Alert.alert("Marquer comme vendue", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Marquer vendue",
        onPress: async () => {
          await authSupabase
            .from("properties")
            .update({ is_sold: true })
            .eq("id", id);
          setProperty((prev) => (prev ? { ...prev, is_sold: true } : prev));
        },
      },
    ]);
  };

  const handleContact = () => {
    const rawNumber = property?.owner_whatsapp?.replace(/\D/g, "");
    if (!rawNumber) {
      Alert.alert(
        "Numéro indisponible",
        "Le vendeur n'a pas renseigné de numéro WhatsApp.",
      );
      return;
    }
    const message = `Bonjour ! Je suis intéressé(e) par la propriété : ${property?.title}`;
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Chargement...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Propriété introuvable</Text>
      </View>
    );
  }

  const lat = Number(property.latitude);
  const lng = Number(property.longitude);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.003
  }%2C${lat - 0.003}%2C${lng + 0.003}%2C${
    lat + 0.003
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  const isLongDesc = (property.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : property.description?.slice(0, 150) + "...";

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View>
          <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
            <FlatList
              data={property.images}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width, height: 300 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          </View>

          {/* Image count badge */}
          <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">
              {activeIndex + 1}/{property.images.length}
            </Text>
          </View>

          {/* Dot indicators */}
          {property.images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
              {property.images.map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </View>
          )}

          {/* Back + Save buttons */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Ionicons name="arrow-back" size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSave}
                disabled={saveLoading}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={isSaved ? "#EF4444" : "#111827"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View
          className="px-5 pt-5 pb-8"
          style={{ opacity: property.is_sold ? 0.6 : 1 }}
        >
          {/* Badges */}
          <View className="flex-row gap-2 mb-3 flex-wrap">
            <View
              className={`px-3 py-1 rounded-full ${
                property.transaction_type === "rent"
                  ? "bg-green-50"
                  : "bg-purple-50"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  property.transaction_type === "rent"
                    ? "text-green-700"
                    : "text-purple-700"
                }`}
              >
                {property.transaction_type === "rent" ? "À louer" : "À vendre"}
              </Text>
            </View>
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-blue-600 text-xs font-semibold">
                {formatPropertyType(property.type)}
              </Text>
            </View>
            {property.is_featured && (
              <View className="bg-amber-50 px-3 py-1 rounded-full">
                <Text className="text-amber-600 text-xs font-semibold">
                  ⭐ En vedette
                </Text>
              </View>
            )}
            {property.is_sold && (
              <View className="bg-red-50 px-3 py-1 rounded-full">
                <Text className="text-red-500 text-xs font-semibold">Vendu</Text>
              </View>
            )}
          </View>

          {/* Title + Price */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {property.title}
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-blue-600 text-xl font-bold">
              {formatPrice(property.price)}
            </Text>
            {property.transaction_type === "rent" && (
              <Text className="text-gray-500 text-sm font-medium">/mois</Text>
            )}
          </View>
          <Text className="text-gray-500 text-xs italic mb-4 capitalize">
            ({formatPriceInWords(property.price)}
            {property.transaction_type === "rent" ? " / mois" : ""})
          </Text>

          {/* Specs Row */}
          <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4 mb-5">
            <SpecItem
              icon="bed-outline"
              label="Chambres"
              value={`${property.bedrooms}`}
            />
            <SpecItem
              icon="water-outline"
              label="SdB"
              value={`${property.bathrooms}`}
            />
            <SpecItem
              icon="expand-outline"
              label="Surface"
              value={`${property.area_sqft} m²`}
            />
            <SpecItem
              icon="home-outline"
              label="Type"
              value={formatPropertyType(property.type)}
            />
          </View>

          {/* Caution & charges (location uniquement) */}
          {property.transaction_type === "rent" &&
            (property.deposit_months || property.monthly_charges) && (
              <View className="flex-row gap-3 mb-5">
                {property.deposit_months ? (
                  <View className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <Text className="text-amber-700 text-xs font-semibold mb-1">
                      Caution
                    </Text>
                    <Text className="text-amber-900 font-bold text-base">
                      {property.deposit_months} mois
                    </Text>
                  </View>
                ) : null}
                {property.monthly_charges ? (
                  <View className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <Text className="text-amber-700 text-xs font-semibold mb-1">
                      Charges / mois
                    </Text>
                    <Text className="text-amber-900 font-bold text-base">
                      {formatPrice(property.monthly_charges)}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

          {/* Équipements */}
          {(property.is_furnished ||
            property.has_generator ||
            property.has_water ||
            property.has_internet ||
            property.has_guardian ||
            property.is_gated) && (
            <View className="mb-5">
              <Text className="text-base font-bold text-gray-900 mb-2">
                Équipements & sécurité
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {property.is_furnished && (
                  <AmenityChip icon="bed-outline" label="Meublé" />
                )}
                {property.has_generator && (
                  <AmenityChip icon="flash-outline" label="Groupe électrogène" />
                )}
                {property.has_water && (
                  <AmenityChip icon="water-outline" label="Eau courante" />
                )}
                {property.has_internet && (
                  <AmenityChip icon="wifi-outline" label="Internet / Fibre" />
                )}
                {property.has_guardian && (
                  <AmenityChip icon="shield-outline" label="Gardien 24h" />
                )}
                {property.is_gated && (
                  <AmenityChip
                    icon="lock-closed-outline"
                    label="Résidence sécurisée"
                  />
                )}
              </View>
            </View>
          )}

          {/* Description */}
          <Text className="text-base font-bold text-gray-900 mb-2">
            Description
          </Text>
          <Text className="text-gray-500 text-sm leading-6 mb-1">
            {displayDesc}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text className="text-blue-600 text-sm font-medium mb-5">
                {expanded ? "Voir moins" : "Voir plus"}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mb-5" />

          {/* Location */}
          <Text className="text-base font-bold text-gray-900 mb-2">
            Localisation
          </Text>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm flex-1">
              {property.address}
              {property.quartier ? `, ${property.quartier}` : ""}, {property.city}
            </Text>
          </View>

          {/* Map Preview */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(root)/property/map",
                params: {
                  latitude: property.latitude,
                  longitude: property.longitude,
                  title: property.title,
                  address: `${property.address}, ${property.city}`,
                },
              })
            }
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ height: 200 }}
          >
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Ionicons name="expand-outline" size={12} color="#374151" />
              <Text className="text-gray-600 text-xs font-medium">
                Toucher pour agrandir
              </Text>
            </View>
          </TouchableOpacity>

          {/* Contact Button */}
          <TouchableOpacity
            onPress={handleContact}
            className="flex-row items-center justify-center gap-2 bg-blue-600 py-4 rounded-2xl mb-4"
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="text-white font-bold text-base">
              Contacter l&apos;agent
            </Text>
          </TouchableOpacity>

          {/* Admin Actions */}
          {isAdmin && (
            <View className="gap-3">
              {!property.is_sold && (
                <TouchableOpacity
                  onPress={handleMarkSold}
                  className="flex-row items-center justify-center gap-2 bg-amber-50 py-4 rounded-2xl border border-amber-200"
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#D97706"
                  />
                  <Text className="text-amber-600 font-semibold">
                    Marquer vendue
                  </Text>
                </TouchableOpacity>
              )}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleEdit}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-blue-50 py-4 rounded-2xl border border-blue-100"
                >
                  <Ionicons name="create-outline" size={18} color="#2563EB" />
                  <Text className="text-blue-600 font-semibold">Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-red-50 py-4 rounded-2xl border border-red-100"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="text-red-500 font-semibold">Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Viewer */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View className="flex-1 justify-center bg-black">
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            initialScrollIndex={activeIndex}
            keyExtractor={(_, index) => index.toString()}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <View
                style={{ width, height: "100%" }}
                className="justify-center"
              >
                <Image
                  source={{ uri: item }}
                  style={{ width, height: "80%" }}
                  resizeMode="contain"
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity
            onPress={() => setImageViewerVisible(false)}
            className="absolute right-5 top-14 h-10 w-10 items-center justify-center rounded-full bg-white/20"
            accessibilityLabel="Fermer la visionneuse d'images"
          >
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="items-center gap-1">
      <Ionicons name={icon} size={20} color="#2563EB" />
      <Text className="text-gray-900 font-bold text-sm">{value}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}

function AmenityChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-2 rounded-full">
      <Ionicons name={icon} size={14} color="#2563EB" />
      <Text className="text-blue-700 text-xs font-semibold">{label}</Text>
    </View>
  );
}
