export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Appartement",
  house: "Maison",
  villa: "Villa",
  studio: "Studio",
};

export const formatPropertyType = (type: string | null | undefined): string =>
  type ? (PROPERTY_TYPE_LABELS[type] ?? type) : "";

export const formatPrice = (value: number): string => {
  if (value >= 1000000) {
    const millions = (value / 1000000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    });
    return `${millions} M€`;
  }
  if (value >= 1000) {
    const thousands = (value / 1000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    });
    return `${thousands} k€`;
  }
  return `${value.toLocaleString("fr-FR")} €`;
};
