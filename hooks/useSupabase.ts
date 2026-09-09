//pour créer un client supabase avec le token d'authentification de clerk  et l'utiliser dans les composants React Native

import { useAuth } from "@clerk/expo";
import { useMemo, useRef } from "react";
import { createClearkSupabaseClient, supabase } from "../lib/supabase";

export function useSupabase() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(() => {
    if (!isLoaded || !isSignedIn) {
      return supabase;
    }

    return createClearkSupabaseClient(() => getTokenRef.current());
  }, [isLoaded, isSignedIn]);
}
