import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  //les donnes ne sont pas encore chargées
  if (!isLoaded) return null;
  // si utilusateur est connecteredirection apres l'authentification
  if (isSignedIn) return <Redirect href="/(root)/(tabs)" />;
  return <Redirect href="/sign-in" />;
}
