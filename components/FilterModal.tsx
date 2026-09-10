import { PropertyType, useFilterStore } from "@/store/filtrerStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";


const TYPES: { label: string; value: PropertyType }[] = [
  { label: "Tous", value: null },
  { label: "Appartement", value: "apartment" },
  { label: "Maison", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Toutes", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Moins de 5 M FCFA", min: null, max: 5_000_000 },
  { label: "5 M – 25 M FCFA", min: 5_000_000, max: 25_000_000 },
  { label: "25 M – 100 M FCFA", min: 25_000_000, max: 100_000_000 },
  { label: "Plus de 100 M FCFA", min: 100_000_000, max: null },
];

const chip = (active: boolean) =>
  `px-4 py-2 rounded-full border ${
    active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
  }`;

const chipText = (active: boolean) =>
  `text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`;

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    type,
    transactionType,
    bedrooms,
    minPrice,
    maxPrice,
    isFurnished,
    hasGenerator,
    hasInternet,
    hasGuardian,
    isGated,
    setType,
    setTransactionType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
    setIsFurnished,
    setHasGenerator,
    setHasInternet,
    setHasGuardian,
    setIsGated,
    resetFilters,
  } = useFilterStore();

  const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : "");


  const activeCount = [type, bedrooms, minPrice, maxPrice].filter(
    (v) => v !== null
  ).length;

  const handleApply = () => {
    setMinPrice(localMin ? Number(localMin) : null);
    setMaxPrice(localMax ? Number(localMax) : null);
    onClose();
  };
  const handleReset = () => {
    setLocalMin("");
    setLocalMax("");
    resetFilters();
    onClose();
  };
  const shadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-6 pb-4 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Filtres</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text className="text-blue-600 font-semibold text-sm">
              Réinitialiser
            </Text>
          </TouchableOpacity>
        </View>
         <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Type */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Type d&apos;annonce
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {(
              [
                { label: "Toutes", value: null },
                { label: "À vendre", value: "sale" as const },
                { label: "À louer", value: "rent" as const },
              ] as const
            ).map((item) => (
              <TouchableOpacity
                key={String(item.value)}
                onPress={() => setTransactionType(item.value)}
                className={chip(transactionType === item.value)}
                style={shadow}
              >
                <Text className={chipText(transactionType === item.value)}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Property Type */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Type de propriété
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {TYPES.map((item) => (
              <TouchableOpacity
                key={String(item.value)}
                onPress={() => setType(item.value)}
                className={chip(type === item.value)}
                style={shadow}
              >
                <Text className={chipText(type === item.value)}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bedrooms */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Chambres
          </Text>
          <View className="flex-row gap-2 mb-6">
            {BEDS.map((item) => (
              <TouchableOpacity
                key={String(item.value)}
                onPress={() => setBedrooms(item.value)}
                className={`flex-1 items-center py-3 rounded-2xl border ${
                  bedrooms === item.value
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-200"
                }`}
                style={shadow}
              >
                <Text
                  className={`text-sm font-bold ${
                    bedrooms === item.value ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Fourchette de prix (FCFA)
          </Text>
          <View className="flex-row gap-3 mb-3">
            {[
              {
                label: "Prix min",
                value: localMin,
                onChange: setLocalMin,
                placeholder: "0",
              },
              {
                label: "Prix max",
                value: localMax,
                onChange: setLocalMax,
                placeholder: "Illimité",
              },
            ].map(({ label, value, onChange, placeholder }) => (
              <View key={label} className="flex-1">
                <Text className="text-xs text-gray-500 mb-1.5 font-medium">
                  {label}
                </Text>
                <View
                  className="flex-row items-center bg-white rounded-2xl px-3 border border-gray-200"
                  style={shadow}
                >
                  <Text className="text-gray-400 text-xs mr-1">FCFA</Text>
                  <TextInput
                    className="flex-1 py-3 text-gray-800"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Price Presets */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {PRICE_PRESETS.map((p) => {
              const active = minPrice === p.min && maxPrice === p.max;
              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => {
                    setLocalMin(p.min ? String(p.min) : "");
                    setLocalMax(p.max ? String(p.max) : "");
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    active
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      active ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Équipements */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Équipements & sécurité
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(
              [
                { label: "Meublé", value: isFurnished, set: setIsFurnished },
                {
                  label: "Groupe électrogène",
                  value: hasGenerator,
                  set: setHasGenerator,
                },
                {
                  label: "Internet / Fibre",
                  value: hasInternet,
                  set: setHasInternet,
                },
                { label: "Gardien 24h", value: hasGuardian, set: setHasGuardian },
                { label: "Résidence sécurisée", value: isGated, set: setIsGated },
              ] as const
            ).map((f) => (
              <TouchableOpacity
                key={f.label}
                onPress={() => f.set(!f.value)}
                className={chip(f.value)}
                style={shadow}
              >
                <Text className={chipText(f.value)}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleApply}
            className="bg-blue-600 rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-bold text-base">
              Appliquer les filtres{activeCount > 0 ? ` (${activeCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
