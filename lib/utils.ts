export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Appartement",
  house: "Maison",
  villa: "Villa",
  studio: "Studio",
};

export const formatPropertyType = (type: string | null | undefined): string =>
  type ? (PROPERTY_TYPE_LABELS[type] ?? type) : "";

export const formatPrice = (value: number): string => {
  if (value >= 1_000_000) {
    const millions = (value / 1_000_000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    });
    return `${millions} M FCFA`;
  }
  return `${value.toLocaleString("fr-FR")} FCFA`;
};

// ─── Conversion nombre → lettres (français) ────────────────────────

const UNITS = [
  "",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];

const TENS = [
  "",
  "",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "soixante",
  "quatre-vingt",
  "quatre-vingt",
];

const numberBelow100 = (n: number): string => {
  if (n < 20) return UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;

  // 70-79 = soixante + 10-19, 90-99 = quatre-vingt + 10-19
  if (t === 7 || t === 9) {
    const base = t === 7 ? "soixante" : "quatre-vingt";
    const rest = 10 + u;
    if (t === 7 && u === 1) return "soixante et onze";
    return `${base}-${UNITS[rest]}`;
  }

  let str = TENS[t];
  if (u === 0) {
    if (t === 8) str += "s"; // quatre-vingts
  } else if (u === 1 && t !== 8) {
    str += " et un";
  } else {
    str += `-${UNITS[u]}`;
  }
  return str;
};

const numberBelow1000 = (n: number): string => {
  if (n < 100) return numberBelow100(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let str = hundreds === 1 ? "cent" : `${UNITS[hundreds]} cent`;
  if (hundreds > 1 && rest === 0) str += "s"; // deux cents
  if (rest > 0) str += ` ${numberBelow100(rest)}`;
  return str;
};

const numberToWords = (n: number): string => {
  if (n === 0) return "zéro";

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(
      billions === 1 ? "un milliard" : `${numberBelow1000(billions)} milliards`,
    );
  }
  if (millions > 0) {
    parts.push(
      millions === 1 ? "un million" : `${numberBelow1000(millions)} millions`,
    );
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? "mille" : `${numberBelow1000(thousands)} mille`);
  }
  if (rest > 0) parts.push(numberBelow1000(rest));

  return parts.join(" ");
};

export const formatPriceInWords = (value: number): string => {
  if (!Number.isFinite(value) || value < 0) return "";
  return `${numberToWords(Math.floor(value))} FCFA`;
};
