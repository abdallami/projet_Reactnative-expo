export type TransactionType = "sale" | "rent";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  transaction_type: TransactionType;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  quartier: string | null;
  latitude: string;
  longitude: string;
  images: string[];
  is_featured: boolean;
  is_sold: boolean;
  owner_clerk_id: string | null;
  owner_whatsapp: string | null;
  is_furnished: boolean;
  deposit_months: number | null;
  monthly_charges: number | null;
  has_generator: boolean;
  has_water: boolean;
  has_internet: boolean;
  has_guardian: boolean;
  is_gated: boolean;
  created_at: string;
}
