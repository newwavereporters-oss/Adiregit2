import { Product, Lead, ExchangeRates } from '../types/admin';

export const INITIAL_EXCHANGE_RATES: ExchangeRates = {
  NGN: 1,
  USD: 0.00078, // 1 NGN ~ $0.00078 (or 1 USD ~ ₦1280)
  GBP: 0.00061,
  EUR: 0.00072,
};

export interface FabricGuideItem {
  id: string;
  name: string;
  tagline: string;
  category: 'daily' | 'streetwear' | 'evening' | 'heritage';
  weight: string;
  swatchGradient: string;
  patternName: string;
  characteristics: string;
  idealOccasion: string;
  recommendedCare: string;
}

export const CORE_FABRICS: FabricGuideItem[] = [
  {
    id: 'adire-cotton',
    name: 'Adire Cotton (Classic)',
    tagline: 'Medium-weight 100% natural breathable weave',
    category: 'daily',
    weight: '180 GSM',
    swatchGradient: 'from-[#1B2A4A] via-[#23375e] to-[#121E36]',
    patternName: 'Eleko Cassava Stencil',
    characteristics: 'Soft crisp handfeel with deep organic indigo saturation. Perfect structure for kaftans, shirts, and tailored trousers.',
    idealOccasion: 'Daily Luxury, Executive Casual & Cultural Celebrations',
    recommendedCare: 'Hand wash cold with gentle soap. Air dry in shade to preserve indigo lusters.',
  },
  {
    id: 'adire-tshirts',
    name: 'Adire T-Shirts (Streetwear)',
    tagline: 'Heavyweight 220 GSM combed jersey cotton',
    category: 'streetwear',
    weight: '220 GSM',
    swatchGradient: 'from-[#121E36] via-[#1B2A4A] to-[#2B3D66]',
    patternName: 'Eleso Marbled Swirls',
    characteristics: 'Boxy streetwear drape with 1-of-1 hand-marbled tie-dye patterns along shoulders and chest.',
    idealOccasion: 'Urban Fashion, Music Festivals & Contemporary Layering',
    recommendedCare: 'Machine wash inside out on delicate cycle. Tumble dry low.',
  },
  {
    id: 'adire-crepe',
    name: 'Adire Crepe (Evening)',
    tagline: 'Fluid pebble-textured luxury drape',
    category: 'evening',
    weight: '140 GSM',
    swatchGradient: 'from-[#2B3D66] via-[#1B2A4A] to-[#0D1526]',
    patternName: 'Oniko Tied Resist Dots',
    characteristics: 'Slight diagonal stretch with ethereal fluid motion. Captures light with subtle matte sheen for evening gowns and agbadas.',
    idealOccasion: 'Red Carpet, Black Tie Galas & Royal Weddings',
    recommendedCare: 'Dry clean recommended or delicate hand wash.',
  },
  {
    id: 'adire-chiffon',
    name: 'Adire Chiffon (Sheer)',
    tagline: 'Ultra-light sheer float for duster coats and wraps',
    category: 'evening',
    weight: '80 GSM',
    swatchGradient: 'from-[#1B2A4A]/80 via-[#3B4E7A] to-[#1B2A4A]/90',
    patternName: 'Abeokuta Wave Stencil',
    characteristics: 'Ethereal sheer texture that catches the breeze effortless. Designed for layering over inner gowns or swimwear.',
    idealOccasion: 'Resort Wear, Evening Dusters & Fashion Show Layering',
    recommendedCare: 'Hand wash gently in cool water. Do not wring.',
  },
  {
    id: 'adire-rayon',
    name: 'Adire Rayon (Fluid)',
    tagline: 'Silky smooth cool-touch plant rayon',
    category: 'daily',
    weight: '120 GSM',
    swatchGradient: 'from-[#1E2E50] via-[#2A3E6A] to-[#121E36]',
    patternName: 'Alagba Block Geometry',
    characteristics: 'Exceptionally cool on warm skin with liquid-like drape. Ideal for tropical climates and flowing resort shirts.',
    idealOccasion: 'Summer Vacations, Beach Resorts & Relaxed Dining',
    recommendedCare: 'Hand wash cold. Line dry in shade.',
  },
  {
    id: 'adire-viscose',
    name: 'Adire Viscose (Soft Touch)',
    tagline: 'Lustrous semi-matte luxury weave',
    category: 'evening',
    weight: '150 GSM',
    swatchGradient: 'from-[#142038] via-[#203258] to-[#0A1220]',
    patternName: 'Koko Sunburst Resist',
    characteristics: 'Smooth tactile feel with architectural structure. Retains vibrant hand-dyed contrast lines crisply.',
    idealOccasion: 'Dinner Parties, Cocktail Hour & Fine Dining',
    recommendedCare: 'Dry clean or hand wash with mild liquid soap.',
  },
  {
    id: 'ibile',
    name: 'Ibile (Ancestral Raw Loom)',
    tagline: 'Handwoven raw loom cotton with authentic indigo pits',
    category: 'heritage',
    weight: '300 GSM',
    swatchGradient: 'from-[#0A1220] via-[#1B2A4A] to-[#101A2E]',
    patternName: 'Aso-Oke Handloom Resist',
    characteristics: 'Heavy weight heirloom quality woven on traditional Yoruba wooden looms prior to deep organic indigo pit soaking.',
    idealOccasion: 'Heritage Collectors, Bespoke Jackets & Cultural Masterpieces',
    recommendedCare: 'Dry clean only to maintain raw loom texture.',
  },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-001',
    fullName: 'Amina Bello',
    email: 'amina.bello@luxuryfashion.ng',
    whatsappNumber: '+234 803 123 4567',
    discountCode: 'DSPINSIDER15',
    fabricPreference: 'Adire Crepe (Evening)',
    dateSubscribed: '2026-07-29 14:22',
    status: 'active',
  },
  {
    id: 'lead-002',
    fullName: 'Marcus Vance',
    email: 'marcus.vance@cultureboutique.com',
    whatsappNumber: '+1 310 555 0192',
    discountCode: 'DSPINSIDER15',
    fabricPreference: 'Ibile (Ancestral Raw)',
    dateSubscribed: '2026-07-29 16:45',
    status: 'contacted',
  },
  {
    id: 'lead-003',
    fullName: 'Folake Adebayo',
    email: 'folake.a@designstudio.co.uk',
    whatsappNumber: '+44 7700 900077',
    discountCode: 'DSPINSIDER15',
    fabricPreference: 'Adire Silk Chiffon',
    dateSubscribed: '2026-07-30 08:12',
    status: 'active',
  },
  {
    id: 'lead-004',
    fullName: 'Chidi Nwosu',
    email: 'chidi.nwosu@urbanstyle.ng',
    whatsappNumber: '+234 812 987 6543',
    discountCode: 'DSPINSIDER15',
    fabricPreference: 'Adire T-Shirts (Streetwear)',
    dateSubscribed: '2026-07-30 09:30',
    status: 'active',
  },
];

export const INITIAL_SHIPPING_LOCATIONS: import('../types/admin').ShippingLocation[] = [];

export const INITIAL_COUPONS: import('../types/admin').Coupon[] = [
  {
    id: 'coup-001',
    code: 'DSPINSIDER15',
    discountPercent: 15,
    leadEmail: 'all',
    usageCount: 18,
    maxUses: 500,
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'coup-002',
    code: 'DSP5-9X2A',
    discountPercent: 5,
    leadEmail: 'amina.bello@luxuryfashion.ng',
    usageCount: 1,
    maxUses: 1,
    isActive: true,
    createdAt: '2026-07-29T14:22:00Z',
  },
  {
    id: 'coup-003',
    code: 'HERITAGE5',
    discountPercent: 5,
    leadEmail: 'all',
    usageCount: 6,
    maxUses: 100,
    isActive: true,
    createdAt: '2026-07-15T00:00:00Z',
  },
];

export const INITIAL_ORDERS: import('../types/admin').Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'DSP-2026-8812',
    customerName: 'Amina Bello',
    customerEmail: 'amina.bello@luxuryfashion.ng',
    customerPhone: '+234 803 123 4567',
    shippingAddress: '14 Banana Island Road, Ikoyi',
    shippingCity: 'Lagos',
    shippingCountry: 'Nigeria',
    shippingLocationId: 'loc-001',
    shippingLocationName: 'Lagos Mainland & Island',
    shippingFee: 5500,
    subtotalAmount: 320000,
    discountAmount: 16000,
    totalAmount: 309500,
    currency: 'NGN',
    paymentStatus: 'paid',
    status: 'processing',
    couponCode: 'DSP5-9X2A',
    adminNotes: 'Customer requested expedited delivery before Friday wedding.',
    createdAt: '2026-07-29T15:30:00Z',
    items: [
      {
        id: 'item-1',
        productId: 'dsp-prod-101',
        productTitle: 'The Royal Olokun Agbada Ensemble',
        productImage: '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
        quantity: 1,
        unitPrice: 320000,
        totalPrice: 320000,
      },
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: 'DSP-2026-8813',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@cultureboutique.com',
    customerPhone: '+1 310 555 0192',
    shippingAddress: '742 Evergreen Terrace',
    shippingCity: 'Beverly Hills, CA',
    shippingCountry: 'United States',
    shippingLocationId: 'loc-004',
    shippingLocationName: 'USA & Canada DHL Doorstep',
    shippingFee: 45,
    subtotalAmount: 273,
    discountAmount: 40.95,
    totalAmount: 277.05,
    currency: 'USD',
    paymentStatus: 'paid',
    status: 'completed',
    couponCode: 'DSPINSIDER15',
    adminNotes: 'Shipped via DHL Tracking #99812736',
    createdAt: '2026-07-30T09:15:00Z',
    items: [
      {
        id: 'item-2',
        productId: 'dsp-prod-103',
        productTitle: 'Ibile Raw Loom Ancestral Tapestry Jacket',
        productImage: '/src/assets/images/adire_fabric_swatch_1785421041385.jpg',
        quantity: 1,
        unitPrice: 273,
        totalPrice: 273,
      },
    ],
  },
];
