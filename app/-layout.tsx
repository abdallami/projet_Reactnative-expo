import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  //les donnes ne sont pas encore chargées
  if (!isLoaded) return null;
  // si utilusateur est connecteredirection apres l'authentification
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  return <Slot />;
}
