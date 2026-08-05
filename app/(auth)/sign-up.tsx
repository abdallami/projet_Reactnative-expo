import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Signup() {
  //les differents etats pour les entrees et sorties
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // pour la fonction de sign up pour verifier si l'utilisateur est connecté ou pas erreur de registration et le status de la requete
  const { signUp, errors, fetchStatus } = useSignUp();
  //pour savoir si l'utilisateur est connecté ou pas
  const { isSignedIn } = useAuth();
  //pour naviguer entre les pages
  const router = useRouter();
  //pour savoir si la requete est en cours ou pas
  const isLoading = fetchStatus === "fetching";

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }
  //fonction de deconnexion

  //la fonction pour s'inscrire
  const onSingnUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: prenom,
      lastName: nom,
    });
    if (error) {
      alert(error.message);
      return;
    }
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifypress = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View className="flex-1 justify-center px-6 py-12">
        <Text className="text-xl font-bold ">Signup</Text>
        <Image
          source={require("../../assets/images/logo.png")}
          className="w-24 h-16 mb-8"
          resizeMode="contain"
          style={{ width: 96, height: 64 }}
        />
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Verify your accout {""}
        </Text>
        <Text className=" text-gray-500 mb-8">we send a code to {email}</Text>
        <View className="flex gap-3 mb-4">
          <TextInput
            className="w-full border border-gray-300 rounded-xl py-3 px-4 "
            placeholder="Entrer vefication code"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          {errors.fields.code && (
            <Text className="text-red-500 mb-4">
              {errors.fields.code.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={onVerifypress}
            disabled={isLoading}
            className="w-full bg-blue-600 rounded-xl items-center mb-4 p-4"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Verify</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => signUp.verifications.sendEmailCode()}
            className="py-2"
          >
            <Text className="text-blue-600">j'ai besoin d'un nouvau code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          className="w-24 h-16 mb-8"
          resizeMode="contain"
          style={{ width: 96, height: 64 }}
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
            value={nom}
            onChangeText={setNom}
          />
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl py-3 px-4"
            placeholder="Prenom"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={prenom}
            onChangeText={setPrenom}
          />
        </View>
        <TextInput
          className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4 "
          placeholder="Email addresse"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {errors.fields.emailAddress && (
          <Text className="text-red-500 mb-4">
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <TextInput
          className="w-full border border-gray-300 rounded-xl py-3 mb-4 "
          placeholder=" password"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.fields.password && (
          <Text className="text-red-500 mb-4">
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSingnUpPress}
          disabled={isLoading}
          className="w-full bg-blue-600 rounded-xl items-center mb-4 p-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Sign Up</Text>
          )}
        </TouchableOpacity>
        <View className="flex-row justify-center items-center gap-2">
          <Text className="text-gray-500">Avez-vous un compte?</Text>
          <Link href="/sign-in ">
            <Text className="text-blue-600 font-semibold">Connectez-vous</Text>
          </Link>
        </View>
        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
