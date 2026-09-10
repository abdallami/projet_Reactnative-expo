import { useSupabase } from "@/hooks/useSupabase";
import { useUserStore } from "@/store/userStore";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const authSupabase = useSupabase();
  const isAdmin = useUserStore((state) => state.isAdmin);
  const whatsappNumber = useUserStore((state) => state.whatsappNumber);
  const setWhatsappNumber = useUserStore((state) => state.setWhatsappNumber);

  const [isUpdating, setIsUpdating] = useState(false);
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [whatsappDraft, setWhatsappDraft] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfileImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission requise",
          "Veuillez autoriser l'accès à votre bibliothèque de photos pour changer votre photo de profil.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setIsUpdating(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Alert.alert("Succès", "Photo de profil mise à jour !");
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour la photo de profil. Veuillez réessayer.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const openWhatsappModal = () => {
    setWhatsappDraft(whatsappNumber ?? "");
    setWhatsappModalVisible(true);
  };

  const saveWhatsapp = async () => {
    const trimmed = whatsappDraft.trim();
    if (!trimmed) {
      Alert.alert("Validation", "Veuillez entrer un numéro WhatsApp.");
      return;
    }
    setSavingWhatsapp(true);
    const { error } = await authSupabase
      .from("users")
      .update({ whatsapp_number: trimmed })
      .eq("clerk_id", user!.id);
    setSavingWhatsapp(false);
    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }
    setWhatsappNumber(trimmed);
    setWhatsappModalVisible(false);
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white mb-10">
      {/* Avatar + Name */}
      <View className="items-center py-8">
        <View className="relative">
          <Image
            source={{ uri: user.imageUrl }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
            className="absolute bottom-3 right-0 bg-blue-600 rounded-full p-2"
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-bold text-gray-800">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-gray-500 mt-1">
          {user.emailAddresses[0].emailAddress}
        </Text>
        {isAdmin && (
          <View className="mt-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <Text className="text-blue-700 text-xs font-semibold">
              Agent immobilier
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View className="px-6 gap-2">
        {isAdmin && (
          <MenuItem
            icon="logo-whatsapp"
            label={
              whatsappNumber
                ? `WhatsApp : ${whatsappNumber}`
                : "Ajouter mon WhatsApp"
            }
            onPress={openWhatsappModal}
          />
        )}
        <MenuItem
          icon="heart-outline"
          label="Mes favoris"
          onPress={() => router.push("/(root)/(tabs)/saved")}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() =>
            Alert.alert(
              "Bientôt disponible",
              "Les notifications arrivent bientôt !",
            )
          }
        />
        <MenuItem
          icon="settings-outline"
          label="Paramètres"
          onPress={() =>
            Alert.alert(
              "Bientôt disponible",
              "Les paramètres arrivent bientôt !",
            )
          }
        />
        <MenuItem
          icon="help-circle-outline"
          label="Aide et support"
          onPress={() =>
            Linking.openURL(
              "mailto:piyushagarwalvo@gmail.com?subject=Aide%20%26%20Support%20-%20Kribb%20App",
            )
          }
        />
      </View>

      {/* Sign Out */}
      <View className="px-6 mt-auto mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 bg-red-50 py-4 rounded-2xl border border-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-base">
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>

      {/* WhatsApp Edit Modal */}
      <Modal
        visible={whatsappModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWhatsappModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              Numéro WhatsApp
            </Text>
            <Text className="text-sm text-gray-500 mb-4">
              Les acheteurs vous contacteront via ce numéro.
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4"
              placeholder="ex. +221771234567"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="phone-pad"
              value={whatsappDraft}
              onChangeText={setWhatsappDraft}
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setWhatsappModalVisible(false)}
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-semibold">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveWhatsapp}
                disabled={savingWhatsapp}
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
              >
                {savingWhatsapp ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-4 bg-gray-50 px-4 py-4 rounded-2xl"
    >
      <Ionicons name={icon} size={22} color="#6B7280" />
      <Text className="flex-1 text-gray-700 font-medium text-base">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
