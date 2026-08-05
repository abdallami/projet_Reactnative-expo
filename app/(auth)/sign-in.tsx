import { useSignIn } from "@clerk/expo";
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

export default function SignIn() {
  //les differents etats pour les entrees et sorties

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [selectedFactor, setSelectedFactor] = useState<any>(null);

  const chooseSecondFactor = (factors: any[] | undefined) => {
    if (!factors?.length) return null;
    return (
      factors.find((factor) => factor.strategy === "email_code") ||
      factors.find((factor) => factor.strategy === "phone_code") ||
      factors.find((factor) => factor.strategy === "totp") ||
      factors.find((factor) => factor.strategy === "backup_code") ||
      factors.find((factor) => factor.strategy === "email_link") ||
      factors[0]
    );
  };

  const sendChallengeForFactor = async (factor: any) => {
    if (!factor) return;
    if (factor.strategy === "email_code") {
      await signIn.mfa.sendEmailCode();
    } else if (factor.strategy === "phone_code") {
      await signIn.mfa.sendPhoneCode();
    } else if (factor.strategy === "email_link") {
      await signIn.mfa.sendEmailLink();
    }
  };

  const { signIn, errors, fetchStatus } = useSignIn();
  //pour naviguer entre les pages
  const router = useRouter();
  //pour savoir si la requete est en cours ou pas
  const isLoading = fetchStatus === "fetching";

  //fonction de deconnexion

  //la fonction pour s'inscrire
  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });
    if (error) {
      alert(error.message);
      return;
    }
    // if (!error) await signIn.verifications.sendEmailCode();
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const factor = chooseSecondFactor(signIn.supportedSecondFactors);
      if (!factor) {
        console.error("Aucun facteur secondaire disponible", signIn);
        return;
      }
      setSelectedFactor(factor);
      await sendChallengeForFactor(factor);
      return;
    }

    console.error("tentative de connexion échouée", signIn);
  };

  const onVerifypress = async () => {
    if (!selectedFactor) return;

    if (selectedFactor.strategy === "email_code") {
      await signIn.mfa.verifyEmailCode({ code });
    } else if (selectedFactor.strategy === "phone_code") {
      await (signIn.mfa as any).verifyPhoneCode({ code });
    } else if (selectedFactor.strategy === "totp") {
      await (signIn.mfa as any).verifyTotpCode({ code });
    } else if (selectedFactor.strategy === "backup_code") {
      await (signIn.mfa as any).verifyBackupCode({ code });
    } else if (selectedFactor.strategy === "email_link") {
      await (signIn.mfa as any).verifyEmailLink?.();
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };
  if (selectedFactor) {
    const isEmailCode = selectedFactor.strategy === "email_code";
    const isEmailLink = selectedFactor.strategy === "email_link";
    const verificationLabel = isEmailCode
      ? `we sent a code to ${email}`
      : selectedFactor.strategy === "phone_code"
        ? "we sent a code to your phone"
        : selectedFactor.strategy === "totp"
          ? "enter the code from your authenticator app"
          : selectedFactor.strategy === "backup_code"
            ? "enter one of your backup codes"
            : "check your email for a verification link";

    return (
      <View className="flex-1 justify-center px-6 py-12">
        <Image
          source={require("../../assets/images/logo.png")}
          className="w-24 h-16 mb-8"
          resizeMode="contain"
          style={{ width: 96, height: 64 }}
        />
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Verify your account
        </Text>
        <Text className=" text-gray-500 mb-8">{verificationLabel}</Text>
        <View className="flex gap-3 mb-4">
          {!isEmailLink && (
            <TextInput
              className="w-full border border-gray-300 rounded-xl py-3 px-4 "
              placeholder="Entrer vefication code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
          )}
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
          {isEmailCode && (
            <TouchableOpacity
              onPress={() => sendChallengeForFactor(selectedFactor)}
              className="py-2"
            >
              <Text className="text-blue-600">{`j'ai besoin d'un nouvau code`}</Text>
            </TouchableOpacity>
          )}
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
          Bienvenue sur notre application
        </Text>
        <Text className=" text-gray-500 mb-8">connectez-vous</Text>

        <TextInput
          className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4 "
          placeholder="Email addresse"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {errors.fields.identifier && (
          <Text className="text-red-500 mb-4">
            {errors.fields.identifier.message}
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
          onPress={onSignInPress}
          disabled={isLoading}
          className="w-full bg-blue-600 rounded-xl items-center mb-4 p-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Sign In</Text>
          )}
        </TouchableOpacity>
        <View className="flex-row justify-center items-center gap-2">
          <Text className="text-gray-500">{"Vous n'avez pas de compte?"}</Text>
          <Link href="/sign-up">
            <Text className="text-blue-600 font-semibold">s'inscrire</Text>
          </Link>
        </View>
        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
