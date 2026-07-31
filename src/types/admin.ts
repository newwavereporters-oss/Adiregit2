export type FabricCategory =
  | 'adire_cotton'
  | 'adire_silk'
  | 'adire_tshirts'
  | 'adire_crepe'
  | 'adire_chiffon'
  | 'adire_rayon'
  | 'adire_viscose'
  | 'ibile';

export type ProductStatus = 'active' | 'draft' | 'archived';

export type ProductUnit = 'yard' | 'piece' | 'set';

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  piece: 'Piece(s)',
  yard: 'Yard(s)',
  set: 'Set(s)',
};

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
  unit?: ProductUnit;
  minOrderQuantity?: number;
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

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingCountry: string;
  shippingLocationId?: string;
  shippingLocationName?: string;
  shippingFee: number;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  couponCode?: string;
  adminNotes?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface ShippingLocation {
  id: string;
  state_region: string;
  rate_ngn: number;
  rate_usd: number;
  rate_gbp: number;
  rate_eur: number;
  delivery_timeframe: string;
  is_active: boolean;
  created_at?: string;

  // Optional backward compatibility properties
  name?: string;
  country?: string;
  timeframe?: string;
  rates?: MultiCurrencyPrice;
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  leadEmail?: string;
  usageCount: number;
  maxUses?: number;
  isActive: boolean;
  createdAt: string;
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
  adire_silk: 'Adire Silk (Luxe)',
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
