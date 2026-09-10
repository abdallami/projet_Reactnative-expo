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
  created_at: string;
}
