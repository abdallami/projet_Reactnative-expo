import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const REPORT_REASONS = [
  { value: "fraud", label: "Annonce frauduleuse" },
  { value: "wrong_price", label: "Prix incorrect" },
  { value: "already_taken", label: "Déjà vendue / louée" },
  { value: "misleading_photos", label: "Photos trompeuses" },
  { value: "cant_contact", label: "Impossible de contacter" },
  { value: "other", label: "Autre" },
] as const;

type Reason = (typeof REPORT_REASONS)[number]["value"];

export default function ReportModal({
  visible,
  onClose,
  propertyId,
}: {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
}) {
  const authSupabase = useSupabase();
  const { userId } = useAuth();
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason(null);
    setDetails("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert("Validation", "Veuillez choisir une raison.");
      return;
    }
    setSubmitting(true);
    const { error } = await authSupabase.from("property_reports").insert({
      property_id: propertyId,
      reporter_clerk_id: userId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      console.error("Report error:", error);
      Alert.alert("Erreur", error.message);
      return;
    }
    reset();
    onClose();
    Alert.alert(
      "Merci !",
      "Votre signalement a bien été envoyé. Nous allons l'examiner.",
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full bg-white rounded-2xl p-6 max-h-[90%]">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="flag-outline" size={20} color="#EF4444" />
            <Text className="text-lg font-bold text-gray-900 flex-1">
              Signaler cette annonce
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-500 mb-4">
            Aidez-nous à garder notre plateforme fiable.
          </Text>

          <Text className="text-xs font-semibold text-gray-700 mb-2 uppercase">
            Raison
          </Text>
          <View className="gap-2 mb-4">
            {REPORT_REASONS.map((r) => {
              const active = reason === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setReason(r.value)}
                  className={`flex-row items-center justify-between p-3 rounded-xl border ${
                    active
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      active ? "text-red-700" : "text-gray-700"
                    }`}
                  >
                    {r.label}
                  </Text>
                  <View
                    className={`w-5 h-5 rounded-full border-2 ${
                      active ? "bg-red-500 border-red-500" : "border-gray-300"
                    } items-center justify-center`}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-xs font-semibold text-gray-700 mb-2 uppercase">
            Détails <Text className="text-gray-400 normal-case">(optionnel)</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl p-3 text-gray-800 h-20 mb-4"
            placeholder="Décrivez brièvement le problème..."
            placeholderTextColor="#9CA3AF"
            value={details}
            onChangeText={setDetails}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-semibold">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !reason}
              className="flex-1 bg-red-500 py-3 rounded-xl items-center"
              style={{ opacity: submitting || !reason ? 0.6 : 1 }}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Signaler</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
