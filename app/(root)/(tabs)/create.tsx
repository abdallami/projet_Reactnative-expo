import { useSupabase } from "@/hooks/useSupabase";
import { formatPriceInWords } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPES = ["apartment", "house", "villa", "studio"] as const;
type PropertyType = (typeof TYPES)[number];

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Appartement",
  house: "Maison",
  villa: "Villa",
  studio: "Studio",
};

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const inputClass =
  "bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800";
const labelClass = "text-sm font-semibold text-gray-700 mb-1.5";
const sectionClass = "mb-5";

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  quartier: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: "",
  address: "",
  city: "",
  quartier: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-1">
      <Text className={labelClass}>{label}</Text>
      <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="remove" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-800 font-bold text-base">
          {value}
        </Text>
        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="add" size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      className={`flex-row items-center justify-between p-4 rounded-2xl border ${
        value ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
      }`}
    >
      <View className="flex-1 mr-3">
        <Text
          className={`font-semibold ${
            value ? "text-blue-700" : "text-gray-700"
          }`}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-gray-400 mt-0.5">{description}</Text>
        )}
      </View>
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          value ? "bg-blue-600 border-blue-600" : "border-gray-300"
        }`}
      >
        {value && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );
}

export default function CreatePropertyScreen() {
  const router = useRouter();
  const authSupabase = useSupabase();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  // ─── Image Picker ──────────────────────────────────────────
  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "Veuillez autoriser l'accès à votre bibliothèque de photos.",
      );
      return;
    }

    const remainingSlots = 6 - form.localImages.length;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    setUploadingImages(true);

    const uploads = result.assets.map(async (asset) => {
      const filename = `property_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.jpg`;

      const base64 = asset.base64!;
      const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { error } = await authSupabase.storage
        .from("property-images")
        .upload(filename, buffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = authSupabase.storage
        .from("property-images")
        .getPublicUrl(filename);

      return { url: urlData.publicUrl, previewUri: asset.uri };
    });

    const results = await Promise.allSettled(uploads);

    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];
    let failed = 0;

    for (const res of results) {
      if (res.status === "fulfilled") {
        uploadedUrls.push(res.value.url);
        previewUris.push(res.value.previewUri);
      } else {
        failed += 1;
        console.error("Upload error:", res.reason);
      }
    }

    if (failed > 0) {
      Alert.alert(
        "Échec du téléversement",
        `${failed} image(s) n'ont pas pu être téléversées.`,
      );
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
      localImages: [...prev.localImages, ...previewUris],
    }));
    setUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      localImages: prev.localImages.filter((_, i) => i !== index),
    }));
  };

  // ─── Location Detection ────────────────────────────────────
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "L'autorisation de localisation est requise pour détecter les coordonnées.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch {
      Alert.alert(
        "Erreur",
        "Impossible de détecter la position. Veuillez la saisir manuellement.",
      );
    } finally {
      setDetectingLocation(false);
    }
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation", "Le titre est requis.");

    if (!form.price.trim())
      return Alert.alert("Validation", "Le prix est requis.");

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Le prix doit être supérieur à 0 FCFA.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Le prix ne peut pas dépasser ${MAX_PRICE.toLocaleString("fr-FR")} FCFA.`,
      );

    if (!form.address.trim())
      return Alert.alert("Validation", "L'adresse est requise.");
    if (!form.city.trim())
      return Alert.alert("Validation", "La ville est requise.");
    if (form.images.length === 0)
      return Alert.alert("Validation", "Veuillez ajouter au moins une image.");

    setSubmitting(true);

    try {
      const { error } = await authSupabase.from("properties").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNum,
        type: form.type,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        address: form.address.trim(),
        city: form.city.trim(),
        quartier: form.quartier.trim() || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        images: form.images,
        is_featured: form.isFeatured,
        is_sold: false,
      });

      if (error) {
        console.error("Property creation error:", error);
        Alert.alert("Création impossible", error.message);
        return;
      }

      setForm(INITIAL_FORM);
      router.replace("/(root)/(tabs)");
      Alert.alert("Succès ! 🎉", "Propriété publiée avec succès.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue.";
      console.error("Property creation exception:", err);
      Alert.alert("Création impossible", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            Ajouter une propriété
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View className={sectionClass}>
            <Text className={labelClass}>
              Photos{" "}
              <Text className="text-gray-400 font-normal">(jusqu&apos;à 6)</Text>
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {form.localImages.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-2xl"
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View className="absolute top-1 left-1 bg-blue-600 px-1.5 py-0.5 rounded-full">
                      <Text className="text-white text-[9px] font-bold">
                        COUVERTURE
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={11} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={uploadingImages}
                  className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 items-center justify-center"
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color="#9CA3AF"
                      />
                      <Text className="text-gray-400 text-xs mt-1">
                        Ajouter
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View className={sectionClass}>
            <Text className={labelClass}>Titre</Text>
            <TextInput
              className={inputClass}
              placeholder="ex. Bel appartement T3 à Paris"
              placeholderTextColor="#9CA3AF"
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>Description</Text>
            <TextInput
              className={`${inputClass} h-24`}
              placeholder="Décrivez la propriété..."
              placeholderTextColor="#9CA3AF"
              value={form.description}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View className={sectionClass}>
            <Text className={labelClass}>Prix (FCFA)</Text>
            <TextInput
              className={inputClass}
              placeholder="ex. 25000000"
              placeholderTextColor="#9CA3AF"
              value={form.price}
              onChangeText={(v) => updateForm({ price: v.replace(/\D/g, "") })}
              keyboardType="numeric"
            />
            {form.price && Number(form.price) > 0 ? (
              <Text className="text-xs text-blue-600 mt-1.5 ml-1 capitalize">
                {formatPriceInWords(Number(form.price))}
              </Text>
            ) : null}
            <Text className="text-xs text-gray-400 mt-1.5 ml-1">
              Fourchette valide : 1 FCFA – {MAX_PRICE.toLocaleString("fr-FR")}{" "}
              FCFA
            </Text>
          </View>

          {/* Property Type */}
          <View className={sectionClass}>
            <Text className={labelClass}>Type de propriété</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateForm({ type: t })}
                  className={`px-4 py-2 rounded-full border ${
                    form.type === t
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      form.type === t ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedrooms / Bathrooms */}
          <View className="flex-row gap-4 mb-5">
            <Counter
              label="Chambres"
              value={form.bedrooms}
              onChange={(v) => updateForm({ bedrooms: v })}
            />
            <Counter
              label="Salles de bain"
              value={form.bathrooms}
              onChange={(v) => updateForm({ bathrooms: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>Superficie (m²)</Text>
            <TextInput
              className={inputClass}
              placeholder="ex. 120"
              placeholderTextColor="#9CA3AF"
              value={form.areaSqft}
              onChangeText={(v) => updateForm({ areaSqft: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View className={sectionClass}>
            <Text className={labelClass}>Adresse</Text>
            <TextInput
              className={inputClass}
              placeholder="Numéro et nom de rue"
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>Ville</Text>
            <TextInput
              className={inputClass}
              placeholder="ex. Dakar"
              placeholderTextColor="#9CA3AF"
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>
              Quartier{" "}
              <Text className="text-gray-400 font-normal">(optionnel)</Text>
            </Text>
            <TextInput
              className={inputClass}
              placeholder="ex. Almadies, Cocody, Yopougon..."
              placeholderTextColor="#9CA3AF"
              value={form.quartier}
              onChangeText={(v) => updateForm({ quartier: v })}
            />
          </View>

          {/* Coordinates */}
          <View className={sectionClass}>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className={labelClass}>Coordonnées</Text>
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons name="locate-outline" size={13} color="#2563EB" />
                )}
                <Text className="text-blue-600 text-xs font-semibold">
                  {detectingLocation ? "Détection..." : "Détecter la position"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Latitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.latitude}
                  onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Longitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.longitude}
                  onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Toggles */}
          <View className="gap-3 mb-5">
            <Toggle
              label="Propriété en vedette"
              description="Afficher dans la section « En vedette » de l'accueil"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            className="bg-blue-600 rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity: submitting || uploadingImages ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Publier la propriété
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
