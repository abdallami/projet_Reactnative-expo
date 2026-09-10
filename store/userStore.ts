//pour stocker l'état de l'utilisateur (isAdmin, whatsappNumber) dans un store Zustand
import { create } from "zustand";
interface UserState {
  isAdmin: boolean;
  whatsappNumber: string | null;
  setIsAdmin: (value: boolean) => void;
  setWhatsappNumber: (value: string | null) => void;
}
export const useUserStore = create<UserState>((set) => ({
  isAdmin: false,
  whatsappNumber: null,
  setIsAdmin: (value) => set({ isAdmin: value }),
  setWhatsappNumber: (value) => set({ whatsappNumber: value }),
}));
