//fichier de configuration pour supabase et notre client supabase et création d'un client supabase pour l'authentification avec un token d'accès
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createClearkSupabaseClient(
  getToken: () => Promise<string | null>,
) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    async accessToken() {
      if (typeof window === "undefined") {
        return null;
      }

      try {
        return await getToken();
      } catch (error: unknown) {
        const clerkError = error as { code?: string };

        if (clerkError?.code === "clerk_runtime_not_browser") {
          return null;
        }

        throw error;
      }
    },
  });
}
