//pour synchroniser les données de l'utilisateur avec le store global et vérifier si l'utilisateur est un administrateur
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const setWhatsappNumber = useUserStore((state) => state.setWhatsappNumber);
  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) return;
    syncUser();
  }, [user]);

  const syncUser = async () => {
    try {
      console.log("🔄 Synchronisation utilisateur Clerk avec Supabase:", user?.id);

      // Chercher l'utilisateur existant
      const { data, error: selectError } = await authSupabase
        .from("users")
        .select("clerk_id, is_admin, whatsapp_number")
        .eq("clerk_id", user!.id)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = pas de résultat trouvé
        console.error("❌ Erreur SELECT utilisateur:", selectError);
        return;
      }

      if (data) {
        // L'utilisateur existe - mettre à jour le store
        console.log("✅ Utilisateur trouvé:", data);
        setIsAdmin(data.is_admin ?? false);
        setWhatsappNumber(data.whatsapp_number ?? null);
        return;
      }

      // L'utilisateur n'existe pas - le créer
      console.log("📝 Création nouvel utilisateur...");
      const metadata = user!.unsafeMetadata as
        | { isAgent?: boolean; whatsappNumber?: string }
        | null;
      const wantsAgent = Boolean(metadata?.isAgent);
      const whatsapp = metadata?.whatsappNumber?.trim() || null;

      const { data: newUser, error: insertError } = await authSupabase
        .from("users")
        .insert({
          clerk_id: user!.id,
          email: user!.emailAddresses[0]?.emailAddress,
          first_name: user!.firstName,
          last_name: user!.lastName,
          avatar_url: user!.imageUrl,
          is_admin: wantsAgent,
          whatsapp_number: whatsapp,
        })
        .select("is_admin, whatsapp_number")
        .single();

      if (insertError) {
        console.error("❌ Erreur INSERT utilisateur:", insertError);
        return;
      }

      console.log("✅ Utilisateur créé:", newUser);
      setIsAdmin(newUser?.is_admin ?? false);
      setWhatsappNumber(newUser?.whatsapp_number ?? null);
    } catch (error) {
      console.error("❌ Erreur synchronisation utilisateur:", error);
    }
  };
};
