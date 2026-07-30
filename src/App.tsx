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
  ShoppingBag,
  Compass,
  Check,
  Scissors,
  CheckCircle2,
  Lock,
  UserCheck,
  Store,
  DollarSign,
  Send,
  MessageSquare,
} from 'lucide-react';

import { AdminAuth } from './components/Admin/AdminAuth';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminBar } from './components/Admin/AdminBar';
import { AdminUser, FabricCategory, CurrencyCode, CURRENCY_SYMBOLS, Product } from './types/admin';
import { CORE_FABRICS, CORE_FABRICS as INITIAL_CORE_FABRICS } from './data/mockData';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// IMAGE ASSETS
const HERO_IMAGE = '/src/assets/images/adire_hero_fashion_1785421009712.jpg';
const ARTISAN_IMAGE = '/src/assets/images/adire_artisan_craft_1785421029164.jpg';
const FABRIC_SWATCH_IMAGE = '/src/assets/images/adire_fabric_swatch_1785421041385.jpg';
const COLLAGE_IMAGE_2 = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
const COLLAGE_IMAGE_3 = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80';

export default function App() {
  // Helper to resolve current view state from window location pathname or hash
  const getViewFromUrl = (): 'storefront' | 'admin-login' | 'admin-register' | 'admin-dashboard' => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('admin-dashboard') || hash.includes('admin-dashboard')) {
      return 'admin-dashboard';
    }
    if (
      path.includes('admin-signin') ||
      path.includes('admin-login') ||
      hash.includes('admin-signin') ||
      hash.includes('admin-login')
    ) {
      return 'admin-login';
    }
    if (path.includes('admin-register') || hash.includes('admin-register')) {
      return 'admin-register';
    }
    return 'storefront';
  };

  // Navigation / View State
  const [currentView, setCurrentView] = useState<
    'storefront' | 'admin-login' | 'admin-register' | 'admin-dashboard'
  >(() => getViewFromUrl());

  // Programmatic URL Navigation Helper
  const navigateTo = (view: 'storefront' | 'admin-login' | 'admin-register' | 'admin-dashboard') => {
    setCurrentView(view);
    let targetPath = '/';
    if (view === 'admin-dashboard') targetPath = '/admin-dashboard';
    else if (view === 'admin-login') targetPath = '/admin-signin';
    else if (view === 'admin-register') targetPath = '/admin-register';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
  };

  // Sync URL Path changes on Back/Forward browser navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(getViewFromUrl());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Auth Session Loading Lock
  const [authLoading, setAuthLoading] = useState(true);

  // Logged In Admin State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const savedSession = localStorage.getItem('dsp_admin_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Supabase Auth State Listener with Loading Lock
  useEffect(() => {
    async function checkAuthSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const adminUser: AdminUser = {
              id: session.user.id,
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Master Admin',
              email: session.user.email || 'admin@dspadire.com',
              role: 'Master Admin',
              registeredAt: session.user.created_at || new Date().toISOString(),
            };
            setCurrentAdmin(adminUser);
            localStorage.setItem('dsp_admin_session', JSON.stringify(adminUser));
          }
        } catch (err) {
          console.error("Auth session check error:", err);
        }
      }
      setAuthLoading(false);
    }

    checkAuthSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const adminUser: AdminUser = {
            id: session.user.id,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Master Admin',
            email: session.user.email || 'admin@dspadire.com',
            role: 'Master Admin',
            registeredAt: session.user.created_at || new Date().toISOString(),
          };
          setCurrentAdmin(adminUser);
          localStorage.setItem('dsp_admin_session', JSON.stringify(adminUser));
        } else if (session === null && !localStorage.getItem('dsp_admin_session')) {
          setCurrentAdmin(null);
        }
        setAuthLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Storefront Active Fabric Selection
  const [selectedFabricId, setSelectedFabricId] = useState<string>('adire-cotton');
  const [fabricFilter, setFabricFilter] = useState<'all' | 'daily' | 'streetwear' | 'evening' | 'heritage'>('all');

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadFabricPref, setLeadFabricPref] = useState('Adire Crepe');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);

  // Catalog Drawer Modal State
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD');

  // Mobile Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Swatch Inquiry Modal
  const [activeInquiryFabric, setActiveInquiryFabric] = useState<any | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [yardsRequested, setYardsRequested] = useState(5);

  const selectedFabric = CORE_FABRICS.find((f) => f.id === selectedFabricId) || CORE_FABRICS[0];

  const filteredFabrics =
    fabricFilter === 'all'
      ? CORE_FABRICS
      : CORE_FABRICS.filter((f) => f.category === fabricFilter);

  // Handle Lead Submission from Homepage (Inserts into Supabase `leads` table)
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadContact) return;

    setIsSubmittingLead(true);

    const emailPayload = leadContact.includes('@')
      ? leadContact
      : `${leadName.toLowerCase().replace(/\s+/g, '')}@customer.ng`;
    const whatsappPayload = leadContact.includes('@') ? '+234 800 000 0000' : leadContact;

    const newLead = {
      id: `lead-${Date.now()}`,
      fullName: leadName,
      email: emailPayload,
      whatsappNumber: whatsappPayload,
      discountCode: 'DSPINSIDER15',
      fabricPreference: leadFabricPref,
      dateSubscribed: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'active' as const,
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('leads').insert([
          {
            full_name: leadName,
            email: emailPayload,
            whatsapp_number: whatsappPayload,
            discount_code: 'DSPINSIDER15',
          },
        ]);

        if (error) {
          console.error("Supabase Lead Insertion Error:", error);
        }
      }
    } catch (error) {
      console.error("Supabase Lead Insertion Error:", error);
    } finally {
      // Always store locally so UI updates immediately
      const existingLeads = JSON.parse(localStorage.getItem('dsp_admin_leads') || '[]');
      localStorage.setItem('dsp_admin_leads', JSON.stringify([newLead, ...existingLeads]));

      setIsSubmittingLead(false);
      setIsLeadSubmitted(true);
    }
  };

  // Swatch Inquiry Submit
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setActiveInquiryFabric(null);
    }, 2500);
  };

  // Admin Logout
  const handleAdminLogout = () => {
    localStorage.removeItem('dsp_admin_session');
    setCurrentAdmin(null);
    navigateTo('admin-login');
  };

  // RENDER ADMIN VIEWS
  if (currentView === 'admin-login') {
    return (
      <AdminAuth
        initialMode="login"
        onLoginSuccess={(user) => {
          setCurrentAdmin(user);
          navigateTo('admin-dashboard');
        }}
        onNavigateToStorefront={() => navigateTo('storefront')}
      />
    );
  }

  if (currentView === 'admin-register') {
    return (
      <AdminAuth
        initialMode="register"
        onLoginSuccess={(user) => {
          setCurrentAdmin(user);
          navigateTo('admin-dashboard');
        }}
        onNavigateToStorefront={() => navigateTo('storefront')}
      />
    );
  }

  if (currentView === 'admin-dashboard') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-3 border-[#D1B464] border-t-transparent animate-spin mb-4" />
          <h2 className="font-serif-title font-bold text-xl text-[#1B2A4A] tracking-wider mb-1">
            DSP ADIRE ADMIN
          </h2>
          <p className="text-xs text-gray-500 font-medium">Verifying admin session credentials...</p>
        </div>
      );
    }

    if (!currentAdmin) {
      // Auth Guard Redirect
      return (
        <AdminAuth
          initialMode="login"
          onLoginSuccess={(user) => {
            setCurrentAdmin(user);
            navigateTo('admin-dashboard');
          }}
          onNavigateToStorefront={() => navigateTo('storefront')}
        />
      );
    }

    return (
      <AdminDashboard
        currentUser={currentAdmin}
        onLogout={handleAdminLogout}
        onNavigateToStorefront={() => navigateTo('storefront')}
      />
    );
  }

  // RENDER STOREFRONT HOMEPAGE VIEW
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans adire-watermark-bg relative overflow-x-hidden selection:bg-[#D1B464]/30">
      
      {/* Floating Global Admin Bar for Logged In Admin Users */}
      <AdminBar
        currentAdmin={currentAdmin}
        onNavigateDashboard={() => navigateTo('admin-dashboard')}
        onLogout={handleAdminLogout}
      />
      
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
            <a href="#artistry" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1">
              The Artistry
            </a>
            <a href="#promise" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1">
              Direct-to-Factory
            </a>
            <a href="#fabric-guide" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1">
              Fabric Guide
            </a>
            <a href="#insider" className="hover:text-[#1B2A4A] hover:font-semibold transition-all relative py-1">
              DSP Insider
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D1B464] text-[#1B2A4A] font-semibold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Fabrics
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
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
                <a href="#artistry" onClick={() => setMobileMenuOpen(false)} className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100">
                  The Artistry
                </a>
                <a href="#promise" onClick={() => setMobileMenuOpen(false)} className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100">
                  Direct-to-Factory Promise
                </a>
                <a href="#fabric-guide" onClick={() => setMobileMenuOpen(false)} className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100">
                  Interactive Fabric Guide
                </a>
                <a href="#insider" onClick={() => setMobileMenuOpen(false)} className="text-base font-serif-title font-medium text-[#1A1A1A] py-1 border-b border-gray-100">
                  Become a DSP Insider
                </a>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCatalogOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#D1B464] text-[#1B2A4A] font-semibold text-xs uppercase tracking-wider"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop All Fabrics</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-8 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B2A4A]/10 border border-[#1B2A4A]/15 text-[#1B2A4A] text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>Authentic Yoruba Textile Artistry</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D1B464]" />
                <span className="text-[#1B2A4A]/70">Direct From Abeokuta</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-[1.12]">
                Crafted Heritage.{' '}
                <span className="gold-gradient-text block mt-1">
                  Hand-Dyed for the Modern Wardrobe.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#1A1A1A]/75 font-normal max-w-2xl leading-relaxed">
                DSP Adire connects you directly to the authentic source of Yoruba textile artistry — eliminating middleman inflation while honoring centuries-old indigo resistance techniques.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="#fabric-guide"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-medium text-sm tracking-wider uppercase shadow-md hover:bg-[#23375e] transition-all cursor-pointer group"
                >
                  <span>Explore Our Craft</span>
                  <ArrowRight className="w-4 h-4 text-[#D1B464] group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  onClick={() => setIsCatalogOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border border-[#E5E7EB] text-[#1A1A1A] font-medium text-sm tracking-wider uppercase shadow-xs hover:border-[#D1B464] hover:bg-[#FAFAFA] transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#1B2A4A]" />
                  <span>View Catalog ($ / ₦ / £ / €)</span>
                </button>
              </div>

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

            {/* Right Fashion Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-[#D1B464]/30 bg-[#1B2A4A]">
                <div className="aspect-[4/5] relative overflow-hidden group">
                  <img
                    src={HERO_IMAGE}
                    alt="DSP Adire Luxury Indigo Garment"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A] via-[#1B2A4A]/20 to-transparent opacity-80" />

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
                Traditional luxury houses mark up authentic African textiles while local dyer guilds receive a fraction of the value. At <strong className="text-[#1B2A4A]">DSP Adire</strong>, we operate directly from our dye houses in Abeokuta, Ogun State — honoring centuries-old Yoruba indigo masterwork.
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
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6"
            >
              <div className="grid grid-cols-2 gap-4 relative">
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

                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 aspect-[4/3] relative group">
                  <img
                    src={FABRIC_SWATCH_IMAGE}
                    alt="Adire Indigo Swatch Detail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 aspect-[4/3] relative group">
                  <img
                    src={COLLAGE_IMAGE_2}
                    alt="Modern Adire Fashion Silhouette"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. INTERACTIVE "FABRIC GUIDE" SECTION
      ------------------------------------------------------------- */}
      <section id="fabric-guide" className="py-24 bg-[#FAFAFA] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-full border border-gray-200 shadow-xs">
              {(['all', 'daily', 'streetwear', 'evening', 'heritage'] as const).map((cat) => (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFabrics.map((fabric) => {
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
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-[#1A1A1A]/70">
                        {fabric.category}
                      </span>
                      <span className="text-xs font-semibold text-[#1B2A4A]">
                        {fabric.weight}
                      </span>
                    </div>

                    <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${fabric.swatchGradient} relative overflow-hidden mb-5 border border-white/20 shadow-inner flex items-center justify-center group`}>
                      <div className="relative z-10 text-center px-2">
                        <span className="text-xs font-serif-title font-semibold text-white/90 italic tracking-wide">
                          {fabric.patternName || 'Yoruba Resist Pattern'}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#D1B464] text-[#1B2A4A] flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-serif-title text-xl font-bold text-[#1A1A1A]">
                      {fabric.name}
                    </h3>
                    
                    <p className="text-xs text-[#1A1A1A]/70 mt-1 font-medium leading-relaxed">
                      {fabric.tagline}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#D1B464]">
                      {isSelected ? 'Active Spec' : 'Inspect'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Fabric Spec Card */}
          {selectedFabric && (
            <div className="mt-10 rounded-3xl bg-white border-2 border-[#D1B464] p-6 sm:p-8 md:p-10 shadow-2xl relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="font-serif-title text-3xl font-bold text-[#1B2A4A]">
                      {selectedFabric.name}
                    </h3>
                    <p className="text-sm text-[#1A1A1A]/80 mt-1 italic font-medium">
                      "{selectedFabric.tagline}"
                    </p>
                  </div>

                  <p className="text-sm text-[#1A1A1A]/80 leading-relaxed border-l-2 border-[#D1B464] pl-4">
                    {selectedFabric.characteristics}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-200">
                      <span className="text-xs uppercase font-bold text-[#1B2A4A]/70 block mb-1">
                        Ideal Occasion
                      </span>
                      <p className="text-xs font-semibold text-[#1A1A1A]">
                        {selectedFabric.idealOccasion}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-200">
                      <span className="text-xs uppercase font-bold text-[#1B2A4A]/70 block mb-1">
                        Recommended Care
                      </span>
                      <p className="text-xs text-[#1A1A1A]/80">
                        {selectedFabric.recommendedCare}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#1B2A4A] text-white p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-[#D1B464] uppercase">
                    Yardage Request Calculator
                  </h4>
                  <div className="flex items-center gap-2">
                    {[3, 5, 10, 20].map((yds) => (
                      <button
                        key={yds}
                        onClick={() => setYardsRequested(yds)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                          yardsRequested === yds ? 'bg-[#D1B464] text-[#1B2A4A]' : 'bg-white/10'
                        }`}
                      >
                        {yds} Yds
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveInquiryFabric(selectedFabric)}
                    className="w-full py-3.5 px-6 rounded-full bg-[#D1B464] text-[#1B2A4A] font-semibold text-xs uppercase tracking-wider hover:bg-[#c4a453] transition-all cursor-pointer shadow-md"
                  >
                    Request Swatch & Quote
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. LEAD CAPTURE SECTION (The Gateway)
      ------------------------------------------------------------- */}
      <section id="insider" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#121E36] to-[#1B2A4A] border-2 border-[#D1B464]/40 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D1B464] text-xs font-bold uppercase tracking-widest border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The DSP Inner Circle</span>
                </div>

                <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  BECOME A DSP INSIDER
                </h2>

                <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                  Join our private client list for early access to limited Abeokuta releases, our complimentary <strong className="text-white">Adire Style & Drapery Guide PDF</strong>, and 15% off your first fabric order.
                </p>
              </div>

              <div className="lg:col-span-5 bg-white text-[#1A1A1A] p-6 sm:p-8 rounded-2xl shadow-xl">
                {isLeadSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                      Welcome to the Inner Circle!
                    </h3>
                    <p className="text-xs text-gray-600">
                      Your 15% discount code <strong className="text-[#1B2A4A] font-mono">DSPINSIDER15</strong> has been generated and logged into our system.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#1B2A4A] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="e.g. Folake Adebayo"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#D1B464]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-[#1B2A4A] mb-1">
                        Email Address or WhatsApp Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={leadContact}
                        onChange={(e) => setLeadContact(e.target.value)}
                        placeholder="email@domain.com or +234..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#D1B464]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full py-3.5 px-6 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-semibold text-xs uppercase tracking-wider hover:bg-[#23375e] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingLead ? (
                        <div className="w-5 h-5 border-2 border-[#D1B464] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Unlock My Guide & 15% Discount</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1B2A4A] text-[#D1B464] font-serif font-bold flex items-center justify-center text-xs">
              D
            </div>
            <span className="font-serif-title font-bold text-lg text-[#1B2A4A]">DSP ADIRE</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-gray-400">
            <span>&copy; {new Date().getFullYear()} DSP Adire Textile Guild. Abeokuta, Ogun State, Nigeria.</span>
            <button
              onClick={() => navigateTo(currentAdmin ? 'admin-dashboard' : 'admin-login')}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400/80 hover:text-gray-600 transition-colors cursor-pointer opacity-60 hover:opacity-100"
              title="Staff Access"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Access</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
