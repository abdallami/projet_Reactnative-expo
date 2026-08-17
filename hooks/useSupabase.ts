//pour créer un client supabase avec le token d'authentification de clerk  et l'utiliser dans les composants React Native

import { useAuth } from "@clerk/expo";
import { useMemo } from "react";
import { createClearkSupabaseClient, supabase } from "../lib/supabase";

export function useSupabase() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMemo(() => {
    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    if (!isBrowser || !isLoaded || !isSignedIn) {
      return supabase;
    }

    return createClearkSupabaseClient(() => getToken());
  }, [getToken, isLoaded, isSignedIn]);
}
