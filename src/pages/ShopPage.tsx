import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  Filter,
  Layers,
  ShieldCheck,
  CheckCircle,
  Truck,
  Menu,
  X,
  Package,
} from 'lucide-react';
import { Product, CurrencyCode, FabricCategory, FABRIC_CATEGORY_LABELS, CURRENCY_SYMBOLS } from '../types/admin';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { convertFromNGN, formatCurrencyValue } from '../utils/currencyAndBank';
import { OrderStatusModal } from '../components/OrderStatusModal';

interface ShopPageProps {
  onNavigateToProduct: (slug: string) => void;
  activeCurrency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onNavigateHome?: () => void;
  onNavigateToAdmin?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onNavigateToProduct,
  activeCurrency,
  onChangeCurrency,
  onNavigateHome,
  onNavigateToAdmin,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);

  // Fetch active products from Supabase or fallback
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            // Map database rows smoothly
            const mapped: Product[] = data.map((item: any) => {
              const rawNgn = Number(String(item.price_ngn ?? item.prices?.ngn ?? 250000).replace(/[^0-9.]/g, '')) || 0;
              const computedUsd = Number(item.price_usd) || (item.prices?.usd ? Number(item.prices.usd) : Math.round((rawNgn / 1600) * 100) / 100);
              const computedGbp = Number(item.price_gbp) || (item.prices?.gbp ? Number(item.prices.gbp) : Math.round((rawNgn / 1900) * 100) / 100);
              const computedEur = Number(item.price_eur) || (item.prices?.eur ? Number(item.prices.eur) : Math.round((rawNgn / 1650) * 100) / 100);

              const galleryList = [
                item.gallery_image_url_1,
                item.gallery_image_url_2,
                item.gallery_image_url_3,
                item.gallery_image_url_4,
              ].filter(Boolean);

              const galleryUrls = galleryList.length > 0 ? galleryList : (item.gallery_urls || item.media?.galleryUrls || []);

              return {
                id: item.id || `dsp-prod-${Date.now()}`,
                title: item.title,
                slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: item.description || '',
                category: item.fabric_category || item.category || 'adire_cotton',
                status: item.status || 'active',
                prices: {
                  ngn: rawNgn,
                  usd: computedUsd,
                  gbp: computedGbp,
                  eur: computedEur,
                },
                media: {
                  primaryUrl: item.primary_image_url || item.media?.primaryUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                  galleryUrls,
                  videoUrl: item.video_url || item.media?.videoUrl || '',
                },
                stockQuantity: item.stock_quantity ?? item.stockQuantity ?? 10,
                inStock: item.in_stock ?? item.inStock ?? true,
                createdAt: item.created_at || new Date().toISOString(),
                updatedAt: item.updated_at || new Date().toISOString(),
              };
            });
            if (isMounted) {
              setProducts(mapped);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, utilizing local sync dataset:', err);
      }

      // Local storage or mock fallback
      const saved = localStorage.getItem('dsp_admin_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const activeOnly = parsed.filter((p: Product) => p.status === 'active');
          if (isMounted) {
            setProducts(activeOnly.length > 0 ? activeOnly : INITIAL_PRODUCTS.filter((p) => p.status === 'active'));
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore error
        }
      }

      if (isMounted) {
        setProducts(INITIAL_PRODUCTS.filter((p) => p.status === 'active'));
        setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const toggleMute = (productId: string) => {
    setMutedMap((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1B2A4A] font-sans selection:bg-[#D1B464] selection:text-[#1B2A4A]">
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* DESKTOP HEADER */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateHome}
                className="font-serif-title text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                DSP <span className="text-[#D1B464]">ADIRE</span>
              </button>
              <span className="px-3 py-1 rounded-full bg-[#D1B464]/15 text-[#1B2A4A] text-xs font-bold border border-[#D1B464]/40 whitespace-nowrap">
                Video Catalog
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Currency Selector Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
                {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => onChangeCurrency(code)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeCurrency === code
                        ? 'bg-[#1B2A4A] text-[#D1B464] shadow-xs'
                        : 'text-gray-600 hover:text-[#1B2A4A]'
                    }`}
                  >
                    {CURRENCY_SYMBOLS[code]} {code}
                  </button>
                ))}
              </div>

              {/* Track Order Button */}
              <button
                onClick={() => setIsTrackerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1B2A4A]/20 hover:border-[#1B2A4A] text-[#1B2A4A] text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-gray-50"
              >
                <Package className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>Track Order</span>
              </button>

              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#1B2A4A] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Admin Suite</span>
                </button>
              )}
            </div>
          </div>

          {/* MOBILE HEADER BAR */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateHome}
                className="font-serif-title text-xl font-black text-[#1B2A4A] tracking-wider cursor-pointer whitespace-nowrap"
              >
                DSP <span className="text-[#D1B464]">ADIRE</span>
              </button>
              <span className="px-2 py-0.5 rounded-full bg-[#D1B464]/15 text-[#1B2A4A] text-[10px] font-bold border border-[#D1B464]/40 whitespace-nowrap">
                Catalog
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-[#1B2A4A] hover:bg-gray-200 cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE HAMBURGER MENU DROPDOWN */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-200 px-5 py-4 shadow-xl space-y-4 overflow-hidden"
            >
              {onNavigateHome && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateHome();
                  }}
                  className="w-full text-left text-xs font-bold text-[#1B2A4A] p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Storefront Home
                </button>
              )}

              {/* Currency Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
                  Select Currency
                </span>
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                  {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        onChangeCurrency(code);
                        setMobileMenuOpen(false);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-center ${
                        activeCurrency === code ? 'bg-[#1B2A4A] text-[#D1B464] shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {CURRENCY_SYMBOLS[code]} {code}
                    </button>
                  ))}
                </div>
              </div>

              {onNavigateToAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToAdmin();
                  }}
                  className="w-full text-left text-xs font-bold text-[#1B2A4A] p-3 rounded-2xl bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Admin Suite
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="relative py-12 sm:py-16 bg-[#1B2A4A] text-white overflow-hidden border-b border-[#D1B464]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D1B464_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D1B464]/20 border border-[#D1B464]/50 text-[#D1B464] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct-from-Factory Yoruba Textile Movement</span>
            </div>
            <h1 className="font-serif-title text-3xl sm:text-5xl font-black text-white leading-tight">
              Video-First Luxury <br />
              <span className="text-[#D1B464] italic">Adire Textile Catalog</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-light leading-relaxed">
              Experience the fluid drape, natural organic indigo sheen, and authentic hand-dyed cassava stencil craft of Abeokuta through immersive motion media before ordering.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#1B2A4A] text-[#D1B464] shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Fabrics ({products.length})</span>
          </button>

          {Object.entries(FABRIC_CATEGORY_LABELS).map(([key, label]) => {
            const count = products.filter((p) => p.category === key).length;
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1B2A4A] text-[#D1B464] shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-[#D1B464] text-[#1B2A4A]' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCT GRID CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-200 p-4 space-y-4">
                <div className="w-full h-56 bg-gray-200 rounded-2xl" />
                <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4 my-8">
            <Filter className="w-12 h-12 text-[#D1B464] mx-auto opacity-60" />
            <h3 className="font-serif-title text-xl font-bold text-[#1B2A4A]">
              No Active Fabrics Found in This Category
            </h3>
            <p className="text-xs text-gray-500">
              Please choose another fabric category or check back shortly as our factory completes new indigo batches.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2.5 rounded-full bg-[#1B2A4A] text-[#FAFAFA] text-xs font-bold hover:bg-[#23375e] transition-colors cursor-pointer"
            >
              Show All Fabrics
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              // Calculate Price in Active Currency
              const baseNgnPrice = product.prices?.ngn || 250000;
              const displayPrice = activeCurrency === 'NGN'
                ? baseNgnPrice
                : (product.prices && product.prices[activeCurrency.toLowerCase() as keyof typeof product.prices]) || convertFromNGN(baseNgnPrice, activeCurrency);

              const formattedPrice = formatCurrencyValue(displayPrice, activeCurrency);

              // Determine Video Source
              const videoSource = product.media?.videoUrl || (product.media as any)?.video_url;
              const primaryImage = product.media?.primaryUrl || (product.media as any)?.primary_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
              const categoryLabel = FABRIC_CATEGORY_LABELS[product.category] || product.category;

              const isMuted = mutedMap[product.id] ?? true;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-3xl border border-gray-200 hover:border-[#D1B464] transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* VIDEO MEDIA CONTAINER (AUTO-PLAY / MOTION PREVIEW) */}
                    <div className="relative aspect-4/3 w-full bg-[#1B2A4A] overflow-hidden">
                      {videoSource && (videoSource.endsWith('.mp4') || videoSource.endsWith('.webm') || videoSource.includes('mixkit') || videoSource.includes('assets') || videoSource.includes('mp4')) ? (
                        <video
                          src={videoSource}
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                          poster={primaryImage}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        /* Fallback Image with Motion Overlay Effect if Video is YouTube or missing */
                        <div className="relative w-full h-full">
                          <img
                            src={primaryImage}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 via-transparent to-transparent opacity-60" />
                        </div>
                      )}

                      {/* Top Overlay Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="px-3 py-1 rounded-full bg-[#1B2A4A]/90 text-[#D1B464] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-[#D1B464]/30 shadow-xs">
                          {categoryLabel}
                        </span>

                        {videoSource && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMute(product.id);
                            }}
                            className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                            title={isMuted ? 'Unmute preview' : 'Mute preview'}
                          >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D1B464]" />}
                          </button>
                        )}
                      </div>

                      {/* Motion Indicator Badge */}
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                        <Play className="w-2.5 h-2.5 fill-[#D1B464] text-[#D1B464]" />
                        <span>Fabric Motion Reel</span>
                      </div>
                    </div>

                    {/* CONTENT DETAILS */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[#1B2A4A] group-hover:text-[#23375e] transition-colors line-clamp-1">
                        {product.title}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block font-medium">Direct Factory Price</span>
                          <span className="font-serif-title text-xl font-black text-[#1B2A4A]">
                            {formattedPrice}
                            <span className="text-[11px] font-normal text-gray-500"> / yard</span>
                          </span>
                        </div>

                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {product.stockQuantity || 12} Yds Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CALL TO ACTION BUTTON */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => onNavigateToProduct(product.slug)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#1B2A4A] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider hover:bg-[#D1B464] hover:text-[#1B2A4A] transition-all duration-300 shadow-md flex items-center justify-center gap-2 group/btn cursor-pointer min-h-[44px]"
                    >
                      <span>Explore Product</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER TRUST BANNER */}
      <footer className="bg-[#1B2A4A] text-white border-t border-[#D1B464]/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <ShieldCheck className="w-8 h-8 text-[#D1B464] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">100% Authentic Yoruba Craft</h4>
              <p className="text-xs text-gray-400">Hand-dyed organic cassava resist from Abeokuta indigo pits.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Truck className="w-8 h-8 text-[#D1B464] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Global Express Courier</h4>
              <p className="text-xs text-gray-400">DHL Doorstep delivery across UK, USA, Europe & Nigeria.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <CheckCircle className="w-8 h-8 text-[#D1B464] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Verified Guarantee</h4>
              <p className="text-xs text-gray-400">Commitment deposit options & GTBank payment verification.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* REAL-TIME ORDER TRACKER MODAL */}
      <OrderStatusModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </div>
  );
};
