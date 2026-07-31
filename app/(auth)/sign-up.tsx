import React from "react";
import { Image, ScrollView, Text, TextInput, View } from "react-native";

export default function Signup() {
  return (
    //le formulaire est un longue on utilise scrolle
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      className="bg-white"
    >
      <View className="flex-1 justify-center px-6 py-12">
        <Text className="text-xl font-bold ">Signup</Text>
        <Image
          source={require("../../assets/images/logo.png")}
          className="w-35 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          créer compte
        </Text>
        <Text className=" text-gray-500 mb-8">
          Trouvez la maison de votre reve
        </Text>
        <View className="flex-row gap-3 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl py-3 px-4 "
            placeholder="Nom"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
      </View>
    </ScrollView>
  );
}
