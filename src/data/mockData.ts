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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'dsp-prod-101',
    title: 'The Royal Olokun Agbada Ensemble',
    slug: 'royal-olokun-agbada-ensemble',
    description: '3-Piece hand-dyed royal ensemble crafted in Abeokuta with cassava paste stencil motifs and metallic gold embroidered neckline.',
    category: 'adire_crepe',
    status: 'active',
    prices: {
      ngn: 320000,
      usd: 250,
      gbp: 195,
      eur: 230,
    },
    media: {
      primaryUrl: '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
      galleryUrls: [
        '/src/assets/images/adire_artisan_craft_1785421029164.jpg',
        '/src/assets/images/adire_fabric_swatch_1785421041385.jpg',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    stockQuantity: 14,
    inStock: true,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-28T14:30:00Z',
  },
  {
    id: 'dsp-prod-102',
    title: 'Abeokuta Heritage Silk Kimono Duster',
    slug: 'abeokuta-heritage-silk-kimono',
    description: 'Breeze sheer chiffon kimono with wide flowing sleeves and continuous ocean wave cassava stencil motifs.',
    category: 'adire_chiffon',
    status: 'active',
    prices: {
      ngn: 200000,
      usd: 156,
      gbp: 122,
      eur: 144,
    },
    media: {
      primaryUrl: '/src/assets/images/adire_artisan_craft_1785421029164.jpg',
      galleryUrls: [
        '/src/assets/images/adire_fabric_swatch_1785421041385.jpg',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
      ],
    },
    stockQuantity: 8,
    inStock: true,
    createdAt: '2026-07-21T11:20:00Z',
    updatedAt: '2026-07-29T09:15:00Z',
  },
  {
    id: 'dsp-prod-103',
    title: 'Ibile Raw Loom Ancestral Tapestry Jacket',
    slug: 'ibile-raw-loom-tapestry-jacket',
    description: 'Heavyweight handwoven structured jacket crafted on traditional Yoruba wooden looms prior to deep organic indigo pit dyeing.',
    category: 'ibile',
    status: 'active',
    prices: {
      ngn: 350000,
      usd: 273,
      gbp: 213,
      eur: 252,
    },
    media: {
      primaryUrl: '/src/assets/images/adire_fabric_swatch_1785421041385.jpg',
      galleryUrls: [
        '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
        '/src/assets/images/adire_artisan_craft_1785421029164.jpg',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      ],
    },
    stockQuantity: 4,
    inStock: true,
    createdAt: '2026-07-22T08:45:00Z',
    updatedAt: '2026-07-28T16:20:00Z',
  },
  {
    id: 'dsp-prod-104',
    title: 'Eleso Marbled Organic Heavyweight Tee',
    slug: 'eleso-marbled-heavyweight-tee',
    description: '220 GSM 100% organic cotton drop-shoulder boxy tee featuring 1-of-1 hand-marbled indigo swirls.',
    category: 'adire_tshirts',
    status: 'active',
    prices: {
      ngn: 72000,
      usd: 56,
      gbp: 44,
      eur: 52,
    },
    media: {
      primaryUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
      ],
    },
    stockQuantity: 25,
    inStock: true,
    createdAt: '2026-07-24T14:10:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  },
  {
    id: 'dsp-prod-105',
    title: 'Koko Viscose Satin Wrap Cocktail Dress',
    slug: 'koko-viscose-satin-wrap-dress',
    description: 'Fluid satin wrap dress with architectural lapels, hand-dyed with tied resist geometry for evening luster.',
    category: 'adire_viscose',
    status: 'draft',
    prices: {
      ngn: 220000,
      usd: 172,
      gbp: 134,
      eur: 158,
    },
    media: {
      primaryUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
      ],
    },
    stockQuantity: 0,
    inStock: false,
    createdAt: '2026-07-25T16:00:00Z',
    updatedAt: '2026-07-29T18:30:00Z',
  },
];

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
