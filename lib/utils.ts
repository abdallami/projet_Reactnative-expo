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
