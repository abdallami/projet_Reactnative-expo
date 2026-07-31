import { useAuth } from '@clerk/expo';
import { Redirect ,Stack} from "expo-router";


export default function AuthLayout() {
  const { isSignedIn ,isLoaded} = useAuth();
//les donnes ne sont pas encore chargées
  if (!isLoaded) {return null;}
  // si utilusateur est connecte redirection apres l'authentification
  if (isSignedIn)  {
    return <Redirect href={"/"} />;
  }
  return <Stack />;
}
