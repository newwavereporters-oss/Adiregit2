export type FabricCategory =
  | 'adire_cotton'
  | 'adire_tshirts'
  | 'adire_crepe'
  | 'adire_chiffon'
  | 'adire_rayon'
  | 'adire_viscose'
  | 'ibile';

export type ProductStatus = 'active' | 'draft' | 'archived';

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface MultiCurrencyPrice {
  ngn: number;
  usd: number;
  gbp: number;
  eur: number;
}

export interface ProductMedia {
  primaryUrl: string;
  galleryUrls: string[]; // up to 4 images
  videoUrl?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: FabricCategory;
  status: ProductStatus;
  prices: MultiCurrencyPrice;
  media: ProductMedia;
  stockQuantity: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  discountCode: string;
  fabricPreference: string;
  dateSubscribed: string;
  status: 'active' | 'contacted';
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  registeredAt: string;
}

export interface ExchangeRates {
  NGN: number;
  USD: number;
  GBP: number;
  EUR: number;
}

export const FABRIC_CATEGORY_LABELS: Record<FabricCategory, string> = {
  adire_cotton: 'Adire Cotton (Classic)',
  adire_tshirts: 'Adire T-Shirts (Streetwear)',
  adire_crepe: 'Adire Crepe (Evening)',
  adire_chiffon: 'Adire Chiffon (Sheer)',
  adire_rayon: 'Adire Rayon (Fluid)',
  adire_viscose: 'Adire Viscose (Soft Touch)',
  ibile: 'Ibile (Ancestral Raw)',
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};
