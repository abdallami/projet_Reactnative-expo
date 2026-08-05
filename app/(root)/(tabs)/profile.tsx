import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";

import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { signOut } = useAuth();

  const router = useRouter();
  //fonction pour deconnecter l'utilisateur
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert(
        "Erreur",
        "Impossible de se déconnecter. Veuillez réessayer.",
      );
    }
  };
  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
