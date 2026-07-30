import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  ArrowRight,
  X,
  Menu,
  Download,
  ShoppingBag,
  Filter,
  CheckCircle2,
  MessageSquare,
  Compass,
  Star,
  ExternalLink,
  Info,
  Check,
  Scissors,
  Layers,
  Feather,
  Sparkle
} from 'lucide-react';

// --- GENERATED IMAGE ASSETS ---
const HERO_IMAGE = "/src/assets/images/adire_hero_fashion_1785421009712.jpg";
const ARTISAN_IMAGE = "/src/assets/images/adire_artisan_craft_1785421029164.jpg";
const FABRIC_SWATCH_IMAGE = "/src/assets/images/adire_fabric_swatch_1785421041385.jpg";

// High-quality fallback/supplemental fashion images
const COLLAGE_IMAGE_2 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
const COLLAGE_IMAGE_3 = "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80";

// --- FABRIC DATA (7 CORE FABRICS) ---
interface Fabric {
  id: string;
  name: string;
  tagline: string;
  weight: string;
  drape: string;
  drapeRating: number; // 1 to 5
  idealOccasion: string;
  dyeTechnique: string;
  recommendedCare: string;
  characteristics: string;
  sampleItems: string[];
  patternName?: string;
  category: 'daily' | 'streetwear' | 'evening' | 'heritage';
  swatchGradient: string;
  accentColor: string;
}

const CORE_FABRICS: Fabric[] = [
  {
    id: 'adire-cotton',
    name: 'Adire Cotton',
    tagline: 'Classic, breathable, daily luxury',
    weight: '180 GSM',
    drape: 'Crisp yet soft with structural body',
    drapeRating: 3,
    idealOccasion: 'Daily resort wear, tailored button-downs & summer casual dresses',
    dyeTechnique: 'Oniko (Raffia hand-tying resistance)',
    recommendedCare: 'Machine wash cold inside-out; line dry in shade or low heat tumble.',
    characteristics: '100% long-staple combed cotton, highly durable, rich deep indigo penetration with crisp geometric definition.',
    sampleItems: ['Resort Short-Sleeve Shirts', 'A-Line Midi Skirts', 'Tailored Casual Trousers'],
    patternName: 'Ibadandun (Ibadan is Sweet Motif)',
    category: 'daily',
    swatchGradient: 'from-[#1B2A4A] via-[#2C3E66] to-[#0F182B]',
    accentColor: '#D1B464'
  },
  {
    id: 'adire-tshirts',
    name: 'Adire T-shirts',
    tagline: 'Modern streetwear meets culture',
    weight: '220 GSM Heavyweight',
    drape: 'Structured boxy fit with clean drop shoulders',
    drapeRating: 2,
    idealOccasion: 'High-fashion streetwear, casual luxury statements & gallery events',
    dyeTechnique: 'Eleso (Hand-marbled tie-dye resist)',
    recommendedCare: 'Gentle hand wash inside out in cool water; iron on low reverse side.',
    characteristics: 'Premium organic ring-spun cotton. Each tee features a 1-of-1 hand-dyed swirl that cannot be duplicated.',
    sampleItems: ['Oversized Drop-Shoulder Tees', 'Cultural Graphic Statement Tops', 'Layered Streetwear Basewear'],
    category: 'streetwear',
    swatchGradient: 'from-[#111827] via-[#1B2A4A] to-[#1F2937]',
    accentColor: '#D1B464'
  },
  {
    id: 'adire-crepe',
    name: 'Adire Crepe',
    tagline: 'Wrinkle-resistant, elegant drape for occasions',
    weight: '140 GSM Silk-Crepe Blend',
    drape: 'Fluid, heavy drop with zero stiffness',
    drapeRating: 5,
    idealOccasion: 'Evening galas, formal agbada ensembles, tailored gowns & red carpet attire',
    dyeTechnique: 'Eleko (Cassava starch freehand paste resist)',
    recommendedCare: 'Professional dry clean recommended or delicate hand soak with mild detergent.',
    characteristics: 'Matte textured face with subtle lustre. Exceptional movement that resists creasing even during long flights or events.',
    sampleItems: ['Floor-Length Gala Gowns', 'Modern Agbada Over-Robes', 'Wide-Leg Pleated Trousers'],
    patternName: 'Eko Wenjele (Lagos Waves Motif)',
    category: 'evening',
    swatchGradient: 'from-[#1B2A4A] via-[#3B4D75] to-[#141E33]',
    accentColor: '#D1B464'
  },
  {
    id: 'adire-chiffon',
    name: 'Adire Chiffon',
    tagline: 'Sheer, lightweight, perfect for evening layers',
    weight: '75 GSM Ultra-Lightweight',
    drape: 'Airy, translucent floating cascade',
    drapeRating: 5,
    idealOccasion: 'Layered kimonos, sheer cape overlays, luxury scarves & beachside resort gowns',
    dyeTechnique: 'Alagba (Gradient indigo dip-dyeing)',
    recommendedCare: 'Hand wash cold gently; air dry flat; gentle steam only.',
    characteristics: 'Gossamer-sheer texture with soft diffused indigo tones that glow under ambient light.',
    sampleItems: ['Sheer Kimono Dusters', 'Statement Evening Scarves', 'Translucent Cape Dresses'],
    patternName: 'Omo Lere (Children Are Wealth Motif)',
    category: 'evening',
    swatchGradient: 'from-[#2C3E66]/80 via-[#1B2A4A]/90 to-[#141E33]/70',
    accentColor: '#D1B464'
  },
  {
    id: 'adire-rayon',
    name: 'Adire Rayon',
    tagline: 'Silky smooth, fluid movement',
    weight: '120 GSM Plant Viscose',
    drape: 'Liquid-like drape with cool tactile feel',
    drapeRating: 5,
    idealOccasion: 'Summer duster coats, relaxed loungewear, fluidity co-ords & tropical travel',
    dyeTechnique: 'Eleso & Eleko Hybrid',
    recommendedCare: 'Cool delicate hand wash; cool iron while slightly damp.',
    characteristics: 'Cooling natural wood-pulp fiber with high moisture absorbency and intense dye saturation.',
    sampleItems: ['Relaxed Lounge Sets', 'Flowing Duster Jackets', 'Breeze Wrap Tops'],
    patternName: 'Orewo (Friendship Knot)',
    category: 'daily',
    swatchGradient: 'from-[#1B2A4A] via-[#2A3B5E] to-[#121B2D]',
    accentColor: '#D1B464'
  },
  {
    id: 'adire-viscose',
    name: 'Adire Viscose',
    tagline: 'Soft touch, bright dye retention',
    weight: '150 GSM Medium Weight',
    drape: 'Substantial silky fall with satin sheen',
    drapeRating: 4,
    idealOccasion: 'Statement wrap dresses, tailored two-piece sets & cocktail wear',
    dyeTechnique: 'Oniko (Intricate tied resist)',
    recommendedCare: 'Dry clean preferred; cool iron on reverse.',
    characteristics: 'Combines the softness of silk with the breathability of natural cellulose. High color retention over years of wear.',
    sampleItems: ['Wrap Midi Dresses', 'Tailored Blazer-Dress Hybrids', 'Formal Co-Ord Pantsuits'],
    patternName: 'Koko Karawun (Snail Shell Wisdom Motif)',
    category: 'daily',
    swatchGradient: 'from-[#141E33] via-[#1B2A4A] to-[#253659]',
    accentColor: '#D1B464'
  },
  {
    id: 'ibile',
    name: 'Ibile (The Ancestral Origin Fabric)',
    tagline: 'Raw, bold, and traditional heavy handwoven cotton',
    weight: '260 GSM Handloom Heavy Cotton',
    drape: 'Regal, structured & bold architectural weight',
    drapeRating: 1,
    idealOccasion: 'Heritage ceremonial attire, heirloom collectors pieces & structured outerwear',
    dyeTechnique: 'Aro Muto (100% Pure Organic Abeokuta Indigo Pit Fermentation)',
    recommendedCare: 'Specialist heritage textile dry clean only.',
    characteristics: 'Handwoven on traditional Yoruba looms prior to indigo dipping. Deep earthy aroma of raw natural indigo leaves (Elu) and cassava ash. Holds its shape with royal stature.',
    sampleItems: ['Ancestral Ceremonial Caftans', 'Structured Tapestry Jackets', 'Heirloom Decorative Wall Pieces'],
    patternName: 'Aje (Goddess of Wealth & Commerce Motif)',
    category: 'heritage',
    swatchGradient: 'from-[#0B111E] via-[#1B2A4A] to-[#0A0F1A]',
    accentColor: '#D1B464'
  }
];

// --- CATALOG PRODUCTS ---
interface CatalogProduct {
  id: string;
  name: string;
  fabricName: string;
  priceUSD: number;
  priceNGN: number;
  description: string;
  image: string;
  tag: string;
  color: string;
}

const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-1',
    name: 'The Royal Olokun Agbada Set',
    fabricName: 'Adire Crepe',
    priceUSD: 380,
    priceNGN: 320000,
    description: '3-Piece hand-dyed royal ensemble with cassava paste stencil motifs and gold metallic neck embroidery.',
    image: HERO_IMAGE,
    tag: 'Bestseller',
    color: 'Deep Indigo / Warm Gold'
  },
  {
    id: 'prod-2',
    name: 'Abeokuta Heritage Silk Kimono',
    fabricName: 'Adire Chiffon',
    priceUSD: 240,
    priceNGN: 200000,
    description: 'Breeze sheer kimono duster with flowing wide sleeves and continuous Olokun water motif pattern.',
    image: ARTISAN_IMAGE,
    tag: 'Limited Edition',
    color: 'Celestial Indigo'
  },
  {
    id: 'prod-3',
    name: 'Ibile Ancestral Tapestry Jacket',
    fabricName: 'Ibile (Raw Loom)',
    priceUSD: 420,
    priceNGN: 350000,
    description: 'Heavyweight handwoven structured jacket crafted on vintage Yoruba looms, hand-dyed in authentic indigo vats.',
    image: FABRIC_SWATCH_IMAGE,
    tag: 'Artisan Heirloom',
    color: 'Midnight Pit Indigo'
  },
  {
    id: 'prod-4',
    name: 'Eleso Cotton Resort Co-Ord Set',
    fabricName: 'Adire Cotton',
    priceUSD: 195,
    priceNGN: 165000,
    description: 'Relaxed button-down cuban shirt with matching tailored drawstring shorts in breathable hand-marbled cotton.',
    image: COLLAGE_IMAGE_2,
    tag: 'New Season',
    color: 'Oceanic Indigo / Bone'
  },
  {
    id: 'prod-5',
    name: 'Adire Streetwear Heavyweight Tee',
    fabricName: 'Adire T-shirts',
    priceUSD: 85,
    priceNGN: 72000,
    description: '220 GSM boxy-fit organic tee featuring individual hand-dyed swirl patterns. No two shirts are identical.',
    image: COLLAGE_IMAGE_3,
    tag: '1-of-1 Piece',
    color: 'Cobalt Swirl'
  },
  {
    id: 'prod-6',
    name: 'Koko Viscose Fluid Wrap Dress',
    fabricName: 'Adire Viscose',
    priceUSD: 260,
    priceNGN: 220000,
    description: 'Architectural wrap dress with satin lustre, hand-dyed in Abeokuta using ancestral tie-resist geometry.',
    image: HERO_IMAGE,
    tag: 'Trending',
    color: 'Royal Sapphire'
  }
];

export default function App() {
  // State
  const [selectedFabricId, setSelectedFabricId] = useState<string>('adire-cotton');
  const [fabricFilter, setFabricFilter] = useState<'all' | 'daily' | 'streetwear' | 'evening' | 'heritage'>('all');
  
  // Lead Form state
  const [leadName, setLeadName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadFabricPref, setLeadFabricPref] = useState('Adire Crepe');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  // Catalog Modal state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [catalogFilter, setCatalogFilter] = useState('all');

  // Swatch Request / Order Inquiry Modal
  const [activeInquiryFabric, setActiveInquiryFabric] = useState<Fabric | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [yardsRequested, setYardsRequested] = useState(5);

  // Mobile nav drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedFabric = CORE_FABRICS.find(f => f.id === selectedFabricId) || CORE_FABRICS[0];

  const filteredFabrics = fabricFilter === 'all' 
    ? CORE_FABRICS 
    : CORE_FABRICS.filter(f => f.category === fabricFilter);

  // Lead Form submission handler
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadContact) return;

    setIsSubmittingLead(true);
    setTimeout(() => {
      setIsSubmittingLead(false);
      setIsLeadSubmitted(true);
      setLeadModalOpen(true);
    }, 900);
  };

  // Inquiry submission
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setActiveInquiryFabric(null);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans adire-watermark-bg relative overflow-x-hidden selection:bg-[#D1B464]/30">
      
      {/* -------------------------------------------------------------
          1. NAVIGATION BAR
      ------------------------------------------------------------- */}
      <header id="nav" className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#E5E7EB]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Text Logo */}
          <a href="#hero" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B2A4A] flex items-center justify-center text-[#D1B464] font-serif font-bold text-lg border border-[#D1B464]/30 shadow-xs group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-serif-title text-2xl font-bold tracking-widest text-[#1B2A4A] leading-tight group-hover:text-[#D1B464] transition-colors">
                DSP ADIRE
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/60 font-medium -mt-1">
                Luxury Yoruba Textiles
              </span>
            </div>
          </a>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#1A1A1A]/80">
            <a href="#artistry" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D1B464] hover:after:w-full after:transition-all">
              The Artistry
            </a>
            <a href="#promise" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D1B464] hover:after:w-full after:transition-all">
              Direct-to-Factory
            </a>
            <a href="#fabric-guide" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D1B464] hover:after:w-full after:transition-all">
              Fabric Guide
            </a>
            <a href="#insider" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D1B464] hover:after:w-full after:transition-all">
              DSP Insider
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D1B464] text-[#1B2A4A] font-semibold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Fabrics & Collections
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="p-2 rounded-full bg-[#D1B464]/20 text-[#1B2A4A]"
              aria-label="Shop Catalog"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#1A1A1A] hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#FAFAFA] border-b border-gray-200 px-6 py-6 shadow-xl"
            >
              <div className="flex flex-col space-y-4">
                <a
                  href="#artistry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100"
                >
                  The Artistry
                </a>
                <a
                  href="#promise"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100"
                >
                  Direct-to-Factory Promise
                </a>
                <a
                  href="#fabric-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100"
                >
                  Interactive Fabric Guide
                </a>
                <a
                  href="#insider"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100"
                >
                  Become a DSP Insider
                </a>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCatalogOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#D1B464] text-[#1B2A4A] font-semibold text-sm uppercase tracking-wider"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shop All Fabrics
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* -------------------------------------------------------------
          2. HERO SECTION
      ------------------------------------------------------------- */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1B2A4A]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-8 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B2A4A]/10 border border-[#1B2A4A]/15 text-[#1B2A4A] text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>Authentic Yoruba Textile Artistry</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D1B464]" />
                <span className="text-[#1B2A4A]/70">Direct From Abeokuta</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-[1.12]">
                Crafted Heritage.{' '}
                <span className="gold-gradient-text block mt-1">
                  Hand-Dyed for the Modern Wardrobe.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-[#1A1A1A]/75 font-normal max-w-2xl leading-relaxed">
                DSP Adire connects you directly to the authentic source of Yoruba textile artistry — eliminating middleman inflation while honoring centuries-old indigo resistance techniques.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="#fabric-guide"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-medium text-sm tracking-wider uppercase shadow-md hover:bg-[#23375e] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
                >
                  <span>Explore Our Craft</span>
                  <ArrowRight className="w-4 h-4 text-[#D1B464] group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  onClick={() => setIsCatalogOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border border-[#E5E7EB] text-[#1A1A1A] font-medium text-sm tracking-wider uppercase shadow-xs hover:border-[#D1B464] hover:bg-[#FAFAFA] transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#1B2A4A]" />
                  <span>View Catalog ($ / ₦)</span>
                </button>
              </div>

              {/* Key Highlights Row */}
              <div className="pt-6 border-t border-[#E5E7EB] grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">100%</p>
                  <p className="text-xs text-[#1A1A1A]/60 font-medium">Organic Indigo Dye</p>
                </div>
                <div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">0%</p>
                  <p className="text-xs text-[#1A1A1A]/60 font-medium">Middlemen Markup</p>
                </div>
                <div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">7 Core</p>
                  <p className="text-xs text-[#1A1A1A]/60 font-medium">Master Fabric Weights</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero High-Fashion Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-[#D1B464]/30 bg-[#1B2A4A]">
                {/* Visual Container */}
                <div className="aspect-[4/5] relative overflow-hidden group">
                  <img
                    src={HERO_IMAGE}
                    alt="DSP Adire Luxury Indigo Garment"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Subtle Dark Indigo Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A] via-[#1B2A4A]/20 to-transparent opacity-80" />

                  {/* Overlaid Badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-white/90 backdrop-blur-md border border-[#D1B464]/40 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-[#D1B464]" />
                      </div>
                      <div>
                        <p className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                          Abeokuta Master Artisans
                        </p>
                        <p className="text-xs text-[#1A1A1A]/70 mt-0.5">
                          Hand-dyed using cassava starch stenciling & natural indigo leaf fermentation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Frame Line */}
                <div className="absolute -inset-2 border border-[#D1B464]/20 rounded-3xl pointer-events-none -z-10" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. "OUR DIRECT-TO-FACTORY PROMISE" SECTION
      ------------------------------------------------------------- */}
      <section id="promise" className="py-20 bg-white border-y border-[#E5E7EB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D1B464]">
              Authenticity & Value Unlocked
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]">
              The DSP Direct-to-Factory Promise
            </h2>
            <div className="w-16 h-0.5 bg-[#D1B464] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Narrative Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 space-y-6"
            >
              <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A] leading-snug">
                Cut Out Luxury Retail Markup. Support Heritage Craftsmanship Directly.
              </h3>
              
              <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                Traditional luxury houses routinely mark up authentic African textiles by over 600%, while local artisans receive a fraction of the value. At <strong className="text-[#1B2A4A]">DSP Adire</strong>, we operate directly from our dye houses in Abeokuta, Ogun State — the historic capital of Yoruba Adire textile masterwork.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="w-10 h-10 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-[#1B2A4A]" />
                  </div>
                  <div>
                    <h4 className="font-serif-title text-lg font-bold text-[#1A1A1A]">
                      Guaranteed 100% Genuine Adire
                    </h4>
                    <p className="text-xs text-[#1A1A1A]/70 mt-1">
                      No cheap screen-printed imitations or synthetic polyester dyes. Every yard is authentic hand-dyed cotton, crepe, or silk.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="w-10 h-10 rounded-lg bg-[#D1B464]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Scissors className="w-5 h-5 text-[#1B2A4A]" />
                  </div>
                  <div>
                    <h4 className="font-serif-title text-lg font-bold text-[#1A1A1A]">
                      Direct Factory Pricing & Bespoke Yards
                    </h4>
                    <p className="text-xs text-[#1A1A1A]/70 mt-1">
                      Buy directly by the yard for bespoke tailoring, wholesale clothing lines, or finished ready-to-wear garments at factory prices.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <div className="w-10 h-10 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-[#D1B464]" />
                  </div>
                  <div>
                    <h4 className="font-serif-title text-lg font-bold text-[#1A1A1A]">
                      Preserving Yoruba Cultural Heritage
                    </h4>
                    <p className="text-xs text-[#1A1A1A]/70 mt-1">
                      Every purchase directly pays master women dyers (Alagba) above fair-trade wages, ensuring the survival of centuries-old techniques.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Sleek 3-Image Collage */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6"
            >
              <div className="grid grid-cols-2 gap-4 relative">
                {/* Image 1: Main Artisan Shot */}
                <div className="col-span-2 rounded-2xl overflow-hidden shadow-lg border border-gray-200 aspect-[16/9] relative group">
                  <img
                    src={ARTISAN_IMAGE}
                    alt="Yoruba Artisan Hand-Dyeing Adire"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#D1B464]">Step 1: Stencil & Resist</span>
                    <p className="text-sm font-serif-title font-semibold">Hand-applied Cassava Starch (Eleko)</p>
                  </div>
                </div>

                {/* Image 2: Swatch Detail */}
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 aspect-[4/3] relative group">
                  <img
                    src={FABRIC_SWATCH_IMAGE}
                    alt="Adire Indigo Swatch Detail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white">
                    <p className="text-xs font-serif-title font-bold">Natural Indigo Vat Oxidation</p>
                  </div>
                </div>

                {/* Image 3: Modern Garment */}
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 aspect-[4/3] relative group">
                  <img
                    src={COLLAGE_IMAGE_2}
                    alt="Modern Adire Fashion Silhouette"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white">
                    <p className="text-xs font-serif-title font-bold">Tailored Runway Precision</p>
                  </div>
                </div>

                {/* Center Badge Accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#D1B464] text-[#1B2A4A] p-2 flex flex-col items-center justify-center text-center shadow-2xl border-2 border-white pointer-events-none">
                  <span className="text-[9px] uppercase font-bold tracking-tighter leading-none">100% Direct</span>
                  <span className="font-serif-title text-sm font-bold leading-none mt-1">Abeokuta</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. INTERACTIVE "FABRIC GUIDE" SECTION (Value-First Core)
      ------------------------------------------------------------- */}
      <section id="fabric-guide" className="py-24 bg-[#FAFAFA] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2A4A]/10 text-[#1B2A4A] text-xs font-bold uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>Core Textile Encyclopedia</span>
              </div>
              <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]">
                THE FABRIC GUIDE
              </h2>
              <p className="text-base text-[#1A1A1A]/70">
                Hover or tap on any swatch below to inspect weight, drape behavior, dye technique, and ideal fashion occasions.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-full border border-gray-200 shadow-xs">
              {(['all', 'daily', 'streetwear', 'evening', 'heritage'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFabricFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    fabricFilter === cat
                      ? 'bg-[#1B2A4A] text-white shadow-xs'
                      : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-gray-100'
                  }`}
                >
                  {cat === 'all' ? 'All 7 Core Fabrics' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 7 Fabrics Interactive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFabrics.map(fabric => {
              const isSelected = selectedFabricId === fabric.id;

              return (
                <motion.div
                  key={fabric.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedFabricId(fabric.id)}
                  className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-white border-[#D1B464] ring-2 ring-[#D1B464]/30 shadow-xl'
                      : 'bg-white border-[#E5E7EB] hover:border-[#D1B464]/60 hover:shadow-md'
                  }`}
                >
                  {/* Swatch Header Visual Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-[#1A1A1A]/70">
                        {fabric.category}
                      </span>
                      <span className="text-xs font-semibold text-[#1B2A4A]">
                        {fabric.weight}
                      </span>
                    </div>

                    {/* Fabric Swatch Color Box */}
                    <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${fabric.swatchGradient} relative overflow-hidden mb-5 border border-white/20 shadow-inner flex items-center justify-center group`}>
                      {/* Geometric Motif Overlay */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D1B464_1px,transparent_1px)] [background-size:12px_12px]" />
                      <div className="relative z-10 text-center px-2">
                        <span className="text-xs font-serif-title font-semibold text-white/90 italic tracking-wide">
                          {fabric.patternName || 'Yoruba Resist Pattern'}
                        </span>
                      </div>
                      
                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#D1B464] text-[#1B2A4A] flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-serif-title text-xl font-bold text-[#1A1A1A] group-hover:text-[#1B2A4A] transition-colors">
                      {fabric.name}
                    </h3>
                    
                    <p className="text-xs text-[#1A1A1A]/70 mt-1 font-medium leading-relaxed">
                      {fabric.tagline}
                    </p>
                  </div>

                  {/* Quick Drape & Action Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span>Drape:</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div
                            key={star}
                            className={`w-1.5 h-1.5 rounded-full ${
                              star <= fabric.drapeRating ? 'bg-[#D1B464]' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <span className={`text-xs font-semibold flex items-center gap-1 ${
                      isSelected ? 'text-[#1B2A4A]' : 'text-[#D1B464]'
                    }`}>
                      {isSelected ? 'Active Spec' : 'Inspect'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Expandable Educational Detail Box for Selected Fabric */}
          <AnimatePresence mode="wait">
            {selectedFabric && (
              <motion.div
                key={selectedFabric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-10 rounded-3xl bg-white border-2 border-[#D1B464] p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#D1B464]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                  
                  {/* Left Column: Specs */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-[#1B2A4A] text-[#D1B464] text-xs font-bold uppercase tracking-wider">
                        {selectedFabric.weight} Spec
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#D1B464]/20 text-[#1B2A4A] text-xs font-bold uppercase tracking-wider">
                        {selectedFabric.dyeTechnique}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#1B2A4A]">
                        {selectedFabric.name}
                      </h3>
                      <p className="text-base text-[#1A1A1A]/80 mt-2 font-medium">
                        "{selectedFabric.tagline}"
                      </p>
                    </div>

                    <p className="text-sm text-[#1A1A1A]/80 leading-relaxed border-l-2 border-[#D1B464] pl-4 italic">
                      {selectedFabric.characteristics}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-200">
                        <span className="text-xs uppercase font-bold text-[#1B2A4A]/70 tracking-wider block mb-1">
                          Ideal Occasion & Drape
                        </span>
                        <p className="text-xs font-semibold text-[#1A1A1A]">
                          {selectedFabric.idealOccasion}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-200">
                        <span className="text-xs uppercase font-bold text-[#1B2A4A]/70 tracking-wider block mb-1">
                          Recommended Care
                        </span>
                        <p className="text-xs text-[#1A1A1A]/80">
                          {selectedFabric.recommendedCare}
                        </p>
                      </div>
                    </div>

                    {/* Sample Items */}
                    <div>
                      <span className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block mb-2">
                        Best Use Cases & Tailoring Ideas:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedFabric.sampleItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-[#1A1A1A] text-xs font-medium border border-gray-200"
                          >
                            <Sparkles className="w-3 h-3 text-[#D1B464]" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Yardage & Inquiry Action */}
                  <div className="lg:col-span-5 bg-[#1B2A4A] text-white p-6 sm:p-8 rounded-2xl space-y-6 border border-[#D1B464]/30 shadow-xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-xs font-bold text-[#D1B464] uppercase tracking-wider">
                          Order Fabric By Yard
                        </span>
                        <span className="text-xs text-gray-300">
                          Factory Direct
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-300 mb-2">
                          Select Quantity (Yards needed for your project):
                        </p>
                        <div className="flex items-center gap-3">
                          {[3, 5, 10, 20].map(yds => (
                            <button
                              key={yds}
                              onClick={() => setYardsRequested(yds)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                yardsRequested === yds
                                  ? 'bg-[#D1B464] text-[#1B2A4A]'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              {yds} Yds
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300">Yardage Estimate:</span>
                          <span className="font-bold text-[#D1B464]">{yardsRequested} Yards</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300">Estimated Tailoring Output:</span>
                          <span className="text-white font-medium">
                            {yardsRequested <= 3 ? '1 Outfit or Kimono' : yardsRequested <= 5 ? '2 Full Outfits / Agbada' : 'Wholesale / Multiple Outfits'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => setActiveInquiryFabric(selectedFabric)}
                        className="w-full py-3.5 px-6 rounded-full bg-[#D1B464] text-[#1B2A4A] font-semibold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Request Fabric Swatch & Price Quote</span>
                      </button>

                      <button
                        onClick={() => setIsCatalogOpen(true)}
                        className="w-full py-3 px-6 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>View Ready-To-Wear Garments</span>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* -------------------------------------------------------------
          5. LEAD CAPTURE SECTION (The Gateway to DSP Insider)
      ------------------------------------------------------------- */}
      <section id="insider" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#121E36] to-[#1B2A4A] border-2 border-[#D1B464]/40 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
            
            {/* Background Pattern Watermark */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D1B464_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D1B464]/20 border border-[#D1B464]/40 text-[#D1B464] text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>Exclusive Gateway</span>
                </div>

                <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  BECOME A DSP INSIDER
                </h2>

                <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-light">
                  Join our inner circle for priority access to limited-run hand-dyed releases, our complimentary digital <strong className="text-[#D1B464] font-semibold">'Adire Style & Care Guide' PDF</strong>, and an instant <strong className="text-[#D1B464] font-semibold">15% off coupon</strong> for your first order.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-[#D1B464] shrink-0" />
                    <span>Instant download: 'The Yoruba Adire Fabric Care & Styling Playbook'</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-[#D1B464] shrink-0" />
                    <span>Direct access to 1-of-1 fabric drops before public launches</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-[#D1B464] shrink-0" />
                    <span>Wholesale yardage price calculator & bespoke tailoring concierges</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Lead Form Container */}
              <div className="lg:col-span-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-2xl shadow-xl">
                  
                  {isLeadSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#D1B464] text-[#1B2A4A] mx-auto flex items-center justify-center shadow-lg">
                        <Check className="w-8 h-8 stroke-[3]" />
                      </div>
                      <h3 className="font-serif-title text-2xl font-bold text-white">
                        Welcome to the DSP Circle!
                      </h3>
                      <p className="text-xs text-gray-200 max-w-sm mx-auto">
                        Your 15% discount code <strong className="text-[#D1B464] text-sm block my-1">DSP-INSIDER15</strong> has been activated!
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setLeadModalOpen(true)}
                          className="px-6 py-2.5 rounded-full bg-[#D1B464] text-[#1B2A4A] font-bold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          View Welcome Pack & PDF
                        </button>
                        <button
                          onClick={() => setIsCatalogOpen(true)}
                          className="px-6 py-2.5 rounded-full bg-white text-[#1B2A4A] font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Browse Collection Now
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-200 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={leadName}
                          onChange={e => setLeadName(e.target.value)}
                          placeholder="e.g. Folake Adebayo"
                          className="w-full px-4 py-3 rounded-xl bg-white/90 text-[#1A1A1A] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#D1B464] border border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-200 mb-1.5">
                          Email Address or WhatsApp Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={leadContact}
                          onChange={e => setLeadContact(e.target.value)}
                          placeholder="folake@example.com or +234..."
                          className="w-full px-4 py-3 rounded-xl bg-white/90 text-[#1A1A1A] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#D1B464] border border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-200 mb-1.5">
                          Preferred Fabric Interest
                        </label>
                        <select
                          value={leadFabricPref}
                          onChange={e => setLeadFabricPref(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D1B464] border border-transparent"
                        >
                          {CORE_FABRICS.map(f => (
                            <option key={f.id} value={f.name}>
                              {f.name} ({f.weight})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingLead}
                        className="w-full py-4 px-6 rounded-full bg-[#D1B464] text-[#1B2A4A] font-bold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-2"
                      >
                        {isSubmittingLead ? (
                          <div className="w-5 h-5 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Unlock My Guide & 15% Discount</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-gray-300 text-center mt-2">
                        🔒 Respecting your privacy. No spam. Unsubscribe anytime.
                      </p>
                    </form>
                  )}

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------------------
          6. FOOTER SECTION
      ------------------------------------------------------------- */}
      <footer className="bg-[#101827] text-white border-t border-gray-800 pt-16 pb-12 relative overflow-hidden">
        
        {/* Subtle Decorative Yoruba Line Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B2A4A] via-[#D1B464] to-[#1B2A4A]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D1B464] text-[#1B2A4A] font-serif font-bold text-base flex items-center justify-center">
                  D
                </div>
                <span className="font-serif-title text-2xl font-bold tracking-widest text-white">
                  DSP ADIRE
                </span>
              </div>

              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Direct-to-factory Yoruba textile house in Abeokuta, Ogun State, Nigeria. Dedicated to authentic organic indigo dyeing, sustainable artisan craft, and contemporary luxury fashion.
              </p>

              <div className="pt-2 flex items-center space-x-4 text-xs text-[#D1B464]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Organic Indigo
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Abeokuta Dye Vats
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif-title text-sm font-bold uppercase tracking-wider text-[#D1B464] mb-4">
                Explore DSP
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><a href="#hero" className="hover:text-white transition-colors">Our Origin Story</a></li>
                <li><a href="#artistry" className="hover:text-white transition-colors">Yoruba Indigo Techniques</a></li>
                <li><a href="#fabric-guide" className="hover:text-white transition-colors">7 Core Fabric Specs</a></li>
                <li><a href="#promise" className="hover:text-white transition-colors">Direct-to-Factory Promise</a></li>
              </ul>
            </div>

            {/* Product & Services */}
            <div>
              <h4 className="font-serif-title text-sm font-bold uppercase tracking-wider text-[#D1B464] mb-4">
                Services & Orders
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><button onClick={() => setIsCatalogOpen(true)} className="hover:text-white transition-colors text-left">Ready-to-Wear Catalog</button></li>
                <li><button onClick={() => setIsCatalogOpen(true)} className="hover:text-white transition-colors text-left">Custom Yardage Orders</button></li>
                <li><button onClick={() => setLeadModalOpen(true)} className="hover:text-white transition-colors text-left">Wholesale Price Calculator</button></li>
                <li><a href="#insider" className="hover:text-white transition-colors">Adire Style Guide PDF</a></li>
              </ul>
            </div>

            {/* Direct Contact & Location */}
            <div>
              <h4 className="font-serif-title text-sm font-bold uppercase tracking-wider text-[#D1B464] mb-4">
                Abeokuta Atelier
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#D1B464] shrink-0" />
                  <span>Itoku Market & Arogba Dye Pits, Abeokuta, Nigeria</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#D1B464] shrink-0" />
                  <span>WhatsApp: +234 (0) 812 345 6789</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#D1B464] shrink-0" />
                  <span>concierge@dspadire.com</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} DSP Adire Luxury Textiles. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <span>Privacy Policy</span>
              <span>Terms of Artisanal Craft</span>
              <span>Cultural Heritage Protection</span>
            </div>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          MODAL 1: PRODUCT CATALOG & SHOWCASE MODAL
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isCatalogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-[#1B2A4A] text-white flex items-center justify-between border-b border-[#D1B464]/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#D1B464]">Direct Factory Collection</span>
                  </div>
                  <h3 className="font-serif-title text-2xl font-bold">
                    DSP Adire Signature Garments & Fabric Swatches
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Currency Toggle */}
                  <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20 text-xs font-bold">
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`px-3 py-1 rounded-full transition-all ${
                        currency === 'USD' ? 'bg-[#D1B464] text-[#1B2A4A]' : 'text-white'
                      }`}
                    >
                      $ USD
                    </button>
                    <button
                      onClick={() => setCurrency('NGN')}
                      className={`px-3 py-1 rounded-full transition-all ${
                        currency === 'NGN' ? 'bg-[#D1B464] text-[#1B2A4A]' : 'text-white'
                      }`}
                    >
                      ₦ NGN
                    </button>
                  </div>

                  <button
                    onClick={() => setIsCatalogOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Catalog Grid */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CATALOG_PRODUCTS.map(prod => (
                    <div
                      key={prod.id}
                      className="group rounded-2xl bg-[#FAFAFA] border border-gray-200 overflow-hidden flex flex-col justify-between hover:border-[#D1B464] hover:shadow-xl transition-all"
                    >
                      <div>
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden relative bg-gray-100">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1B2A4A] text-[#D1B464] text-[10px] font-bold uppercase tracking-wider">
                            {prod.tag}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                            <span>{prod.fabricName}</span>
                            <span>{prod.color}</span>
                          </div>

                          <h4 className="font-serif-title text-lg font-bold text-[#1A1A1A] group-hover:text-[#1B2A4A] transition-colors">
                            {prod.name}
                          </h4>

                          <p className="text-xs text-gray-600 line-clamp-2">
                            {prod.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer & Price */}
                      <div className="p-5 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Direct Price</span>
                          <span className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                            {currency === 'USD' ? `$${prod.priceUSD}` : `₦${prod.priceNGN.toLocaleString()}`}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setIsCatalogOpen(false);
                            alert(`Thank you for inquiring about "${prod.name}"! Direct concierge order initiated.`);
                          }}
                          className="px-4 py-2 rounded-full bg-[#1B2A4A] text-white text-xs font-semibold hover:bg-[#D1B464] hover:text-[#1B2A4A] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Order Piece</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between px-8 gap-2">
                <span>Need custom yardage or wholesale roll quantities?</span>
                <button
                  onClick={() => {
                    setIsCatalogOpen(false);
                    const guideEl = document.getElementById('fabric-guide');
                    guideEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-bold text-[#1B2A4A] hover:underline cursor-pointer"
                >
                  Use the Interactive Fabric Guide →
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL 2: DSP INSIDER WELCOME PACK & PDF DOWNLOAD
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {leadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#D1B464] text-center relative"
            >
              <button
                onClick={() => setLeadModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-[#1B2A4A] text-[#D1B464] mx-auto flex items-center justify-center mb-4 shadow-lg border border-[#D1B464]">
                <Sparkles className="w-8 h-8" />
              </div>

              <h3 className="font-serif-title text-3xl font-bold text-[#1B2A4A]">
                You're In, {leadName || 'Insider'}!
              </h3>

              <p className="text-xs text-gray-600 mt-2">
                Your exclusive 15% discount code and Adire Style Playbook are unlocked below.
              </p>

              <div className="my-6 p-4 rounded-2xl bg-[#FAFAFA] border-2 border-dashed border-[#D1B464] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Your First Order Discount Coupon
                </span>
                <div className="font-serif-title text-2xl font-bold text-[#1B2A4A] tracking-widest">
                  DSP-INSIDER15
                </div>
                <span className="text-[10px] text-green-700 font-semibold block">
                  ✓ Valid for all fabric yards & ready-to-wear pieces
                </span>
              </div>

              <div className="space-y-3">
                <a
                  href="#fabric-guide"
                  onClick={() => setLeadModalOpen(false)}
                  className="w-full py-3.5 px-6 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#283d67] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4 text-[#D1B464]" />
                  <span>Download 'Adire Style & Care' PDF Guide</span>
                </a>

                <button
                  onClick={() => {
                    setLeadModalOpen(false);
                    setIsCatalogOpen(true);
                  }}
                  className="w-full py-3 px-6 rounded-full bg-[#D1B464] text-[#1B2A4A] font-bold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Apply Code & Shop Catalog</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL 3: FABRIC SWATCH & INQUIRY MODAL
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeInquiryFabric && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative"
            >
              <button
                onClick={() => setActiveInquiryFabric(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B2A4A] text-[#D1B464] flex items-center justify-center font-bold">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D1B464] tracking-wider block">
                      Custom Yardage Request
                    </span>
                    <h3 className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                      {activeInquiryFabric.name}
                    </h3>
                  </div>
                </div>

                {inquirySuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <p className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                      Yardage Inquiry Received!
                    </p>
                    <p className="text-xs text-gray-600">
                      Our Abeokuta dye house concierge will reach out via WhatsApp/Email shortly with exact yardage pricing.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4 pt-2">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-500">Fabric Weight:</span>
                        <span className="text-[#1B2A4A] font-bold">{activeInquiryFabric.weight}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-500">Selected Quantity:</span>
                        <span className="text-[#D1B464] font-bold">{yardsRequested} Yards</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tayo Ogunsanya"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1B2A4A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        WhatsApp Number or Email
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+234 or email@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1B2A4A] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#D1B464] hover:text-[#1B2A4A] transition-all shadow-md cursor-pointer"
                    >
                      Submit Yardage Inquiry
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

