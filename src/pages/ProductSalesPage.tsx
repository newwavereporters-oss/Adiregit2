import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Sparkles,
  ArrowDown,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Truck,
  MessageSquare,
  X,
  Menu,
  CreditCard,
  Building2,
  Tag,
  MapPin,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  FileText,
} from 'lucide-react';
import { FormattedProductDescription } from '../components/FormattedProductDescription';
import { OrderStatusModal } from '../components/OrderStatusModal';
import { CurrencyDropdown } from '../components/CurrencyDropdown';
import { FloatingTrackOrderCard } from '../components/FloatingTrackOrderCard';
import {
  Product,
  CurrencyCode,
  ShippingLocation,
  Coupon,
  Order,
  FABRIC_CATEGORY_LABELS,
  CURRENCY_SYMBOLS,
} from '../types/admin';
import { INITIAL_PRODUCTS, INITIAL_SHIPPING_LOCATIONS, INITIAL_COUPONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapSupabaseProductToProduct } from '../utils/productMapper';
import { mapSupabaseShippingLocation } from '../utils/shippingMapper';
import {
  convertFromNGN,
  formatCurrencyValue,
  getCommitmentDeposit,
  BANK_DETAILS,
} from '../utils/currencyAndBank';

interface ProductSalesPageProps {
  slug: string;
  activeCurrency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onNavigateBack: () => void;
  onOrderCreated?: (order: Order) => void;
}

export const ProductSalesPage: React.FC<ProductSalesPageProps> = ({
  slug,
  activeCurrency,
  onChangeCurrency,
  onNavigateBack,
  onOrderCreated,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form & Checkout State
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantityYards, setQuantityYards] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');

  // Sync quantity state when product loads with minOrderQuantity
  useEffect(() => {
    if (product) {
      const minQty = product.minOrderQuantity || 1;
      setQuantityYards((q) => (q < minQty ? minQty : q));
    }
  }, [product?.id, product?.minOrderQuantity]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Shipping State
  const [shippingLocations, setShippingLocations] = useState<ShippingLocation[]>(INITIAL_SHIPPING_LOCATIONS);
  const [selectedShippingId, setSelectedShippingId] = useState<string>(INITIAL_SHIPPING_LOCATIONS[0]?.id || '');

  // Payment Option: 'pod' (Pay on Delivery with 2k deposit) or 'full' (Pay Full Amount with 3% discount)
  const [paymentOption, setPaymentOption] = useState<'pod' | 'full'>('pod');

  // Buyer Information Form
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [buyerAddress, setBuyerAddress] = useState<string>('');
  const [buyerCity, setBuyerCity] = useState<string>('');

  // Submittal & Modal State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);

  // Video Mute state & Mobile Menu state & Tracker state
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);

  // Load product & shipping locations directly from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchProductData() {
      // 1. Fetch Product directly from Supabase where slug equals passed slug prop
      if (isSupabaseConfigured && supabase) {
        let { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        // Fallback check by UUID if slug didn't match and slug is a valid UUID
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug || '');
        if (!data && !error && isUuid) {
          const idRes = await supabase
            .from('products')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
          data = idRes.data;
          error = idRes.error;
        }

        if (isMounted) {
          if (!error && data) {
            setProduct(mapSupabaseProductToProduct(data));
          } else {
            const foundFallback = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
            setProduct(foundFallback || null);
          }
        }
      } else {
        if (isMounted) {
          const foundFallback = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
          setProduct(foundFallback || null);
        }
      }

      // 2. Fetch Shipping Locations
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: shippingData } = await supabase
            .from('shipping_locations')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (shippingData && isMounted) {
            const mapped = shippingData.map(mapSupabaseShippingLocation);
            setShippingLocations(mapped);
            if (mapped.length > 0) {
              setSelectedShippingId((prev) => (mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
            }
          }
        }
      } catch (e) {
        // ignore errors
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    fetchProductData();

    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('product_page_shipping_live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'shipping_locations' },
          async () => {
            const { data } = await supabase
              .from('shipping_locations')
              .select('*')
              .eq('is_active', true)
              .order('created_at', { ascending: false });
            if (isMounted && data) {
              const mapped = data.map(mapSupabaseShippingLocation);
              setShippingLocations(mapped);
              if (mapped.length > 0) {
                setSelectedShippingId((prev) => (mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
              }
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#1B2A4A] border-t-[#D1B464] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
            Retrieving Luxury Yoruba Textile Record...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-xl font-serif text-[#1B2A4A] font-bold">Textile Record Not Found</h2>
          <p className="text-xs text-gray-500">
            The requested textile product could not be located in our catalog.
          </p>
          <button
            onClick={onNavigateBack}
            className="w-full py-3 bg-[#1B2A4A] text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-[#25375c] transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  // PRICING & UNIT CALCULATIONS
  const unitLabel = product.unit === 'yard' ? 'Yard' : product.unit === 'set' ? 'Set' : 'Piece';
  const unitPlural = (qty = 1) => {
    if (product.unit === 'yard') return qty === 1 ? 'Yard' : 'Yards';
    if (product.unit === 'set') return qty === 1 ? 'Set' : 'Sets';
    return qty === 1 ? 'Piece' : 'Pieces';
  };
  const unitAbbr = (qty = 1) => {
    if (product.unit === 'yard') return qty === 1 ? 'Yd' : 'Yds';
    if (product.unit === 'set') return qty === 1 ? 'Set' : 'Sets';
    return qty === 1 ? 'Pc' : 'Pcs';
  };
  const minOrderQty = product.minOrderQuantity || 1;

  const baseNgnUnitPrice = product.prices?.ngn || 250000;
  const unitPriceInCurrency = activeCurrency === 'NGN'
    ? baseNgnUnitPrice
    : (product.prices && product.prices[activeCurrency.toLowerCase() as keyof typeof product.prices]) || convertFromNGN(baseNgnUnitPrice, activeCurrency);

  const subtotalBeforeDiscounts = unitPriceInCurrency * quantityYards;

  // 1. Coupon Discount Calculation (5% or applied coupon %)
  const couponDiscountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const couponDiscountAmount = (subtotalBeforeDiscounts * couponDiscountPercent) / 100;

  // 2. Full Payment 3% Discount Calculation
  const fullPaymentDiscountPercent = paymentOption === 'full' ? 3 : 0;
  const fullPaymentDiscountAmount = (subtotalBeforeDiscounts * fullPaymentDiscountPercent) / 100;

  const totalDiscountAmount = couponDiscountAmount + fullPaymentDiscountAmount;

  // 3. Shipping Location Rate
  const activeShippingLoc = shippingLocations.find((loc) => loc.id === selectedShippingId) || shippingLocations[0];

  const getShippingFee = (loc: ShippingLocation | undefined) => {
    if (!loc) return 0;
    if (activeCurrency === 'NGN') return loc.rate_ngn ?? loc.rates?.ngn ?? 0;
    if (activeCurrency === 'USD') return loc.rate_usd ?? loc.rates?.usd ?? 0;
    if (activeCurrency === 'GBP') return loc.rate_gbp ?? loc.rates?.gbp ?? 0;
    if (activeCurrency === 'EUR') return loc.rate_eur ?? loc.rates?.eur ?? 0;
    return loc.rate_usd ?? loc.rates?.usd ?? 0;
  };

  const shippingFeeInCurrency = getShippingFee(activeShippingLoc);

  const grandTotal = Math.max(0, subtotalBeforeDiscounts - totalDiscountAmount + shippingFeeInCurrency);

  // Check if delivery location/city is within Lagos State
  const isLagosDelivery = (
    (activeShippingLoc?.state_region || activeShippingLoc?.name || '').toLowerCase().includes('lagos') ||
    (buyerCity || '').toLowerCase().includes('lagos') ||
    (buyerAddress || '').toLowerCase().includes('lagos')
  );

  // Payment on Delivery is strictly available within Lagos State. Outside Lagos requires full payment before delivery.
  const effectivePaymentOption = (!isLagosDelivery && paymentOption === 'pod') ? 'full' : paymentOption;

  // Deposit calculation for POD (Pay on Delivery: ₦5,000 NGN default)
  const depositInfo = getCommitmentDeposit(activeCurrency);
  const commitmentDepositAmount = Math.min(grandTotal, depositInfo.amount);
  const remainingBalanceOnDelivery = Math.max(0, grandTotal - commitmentDepositAmount);

  // Pay Now amount depends on payment option selected
  const payNowAmount = effectivePaymentOption === 'pod' ? commitmentDepositAmount : grandTotal;

  // Validate Coupon Code
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(null);

    // Try Supabase lookup or local initial coupons
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('coupons')
          .select('*')
          .ilike('code', couponCode.trim())
          .eq('is_active', true)
          .single();

        if (data) {
          setAppliedCoupon({
            id: data.id,
            code: data.code,
            discountPercent: data.discount_percent || data.discountPercent || 5,
            leadEmail: data.lead_email,
            usageCount: data.usage_count || 0,
            isActive: true,
            createdAt: data.created_at,
          });
          return;
        }
      }
    } catch (e) {
      // fallback
    }

    const matchedLocal = INITIAL_COUPONS.find(
      (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.isActive
    );

    if (matchedLocal) {
      setAppliedCoupon(matchedLocal);
    } else {
      setCouponError('Invalid or expired coupon code. Enter code from subscriber offer (e.g. HERITAGE5 or DSPINSIDER15).');
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !buyerPhone || !buyerAddress) {
      alert('Please fill in all buyer information fields.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderNumber = `DSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItemsPayload = [
      {
        id: `item-${Date.now()}`,
        product_id: product.id,
        productId: product.id,
        title: product.title,
        productTitle: product.title,
        product_image: product.media?.primaryUrl,
        productImage: product.media?.primaryUrl,
        quantity: quantityYards,
        unit: product.unit || 'yard',
        unit_price: unitPriceInCurrency,
        unitPrice: unitPriceInCurrency,
        total_price: subtotalBeforeDiscounts,
        totalPrice: subtotalBeforeDiscounts,
      },
    ];

    const newOrderRecord: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: generatedOrderNumber,
      customerName: buyerName,
      customerEmail: buyerEmail,
      customerPhone: buyerPhone,
      shippingAddress: buyerAddress,
      shippingCity: buyerCity || 'Lagos',
      shippingCountry: activeShippingLoc?.country || 'Nigeria',
      shippingLocationId: activeShippingLoc?.id,
      shippingLocationName: activeShippingLoc?.state_region || activeShippingLoc?.name || 'Lagos Courier',
      shippingFee: shippingFeeInCurrency,
      subtotalAmount: subtotalBeforeDiscounts,
      discountAmount: totalDiscountAmount,
      totalAmount: grandTotal,
      currency: activeCurrency,
      paymentStatus: effectivePaymentOption === 'full' ? 'paid' : 'pending',
      status: 'pending',
      couponCode: appliedCoupon?.code,
      adminNotes: effectivePaymentOption === 'pod'
        ? `Pay on Delivery (Lagos State). Deposit Paid: ${formatCurrencyValue(commitmentDepositAmount, activeCurrency)}. Balance Due: ${formatCurrencyValue(remainingBalanceOnDelivery, activeCurrency)}.`
        : `Full Payment Selected. Total Paid: ${formatCurrencyValue(grandTotal, activeCurrency)}.`,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          productId: product.id,
          productTitle: product.title,
          productImage: product.media?.primaryUrl,
          quantity: quantityYards,
          unitPrice: unitPriceInCurrency,
          totalPrice: subtotalBeforeDiscounts,
        },
      ],
    };

    // Save to Supabase
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: createdOrder, error: orderErr } = await supabase
          .from('orders')
          .insert([
            {
              order_number: generatedOrderNumber,
              customer_name: buyerName,
              customer_email: buyerEmail,
              customer_phone: buyerPhone,
              shipping_address: buyerAddress,
              shipping_city: buyerCity || 'Lagos',
              shipping_state: activeShippingLoc?.state_region || activeShippingLoc?.name || buyerCity || 'Lagos',
              shipping_country: activeShippingLoc?.country || 'Nigeria',
              shipping_location_id: activeShippingLoc?.id || null,
              shipping_location_name: activeShippingLoc?.state_region || activeShippingLoc?.name || 'Standard Courier',
              shipping_fee: shippingFeeInCurrency,
              shipping_cost: shippingFeeInCurrency,
              notes: newOrderRecord.adminNotes || '',
              subtotal: subtotalBeforeDiscounts,
              subtotal_amount: subtotalBeforeDiscounts,
              discount_amount: totalDiscountAmount,
              total_amount: grandTotal,
              currency: activeCurrency,
              items: orderItemsPayload,
              payment_status: 'unpaid',
              order_status: 'pending',
              status: 'pending',
              coupon_code: appliedCoupon?.code || null,
              admin_notes: newOrderRecord.adminNotes,
            },
          ])
          .select()
          .single();

        if (orderErr) {
          console.error('Supabase ProductSalesPage order insert error:', orderErr);
        } else if (createdOrder) {
          try {
            const dbItems = orderItemsPayload.map((item) => ({
              order_id: createdOrder.id,
              product_id: item.productId,
              product_title: item.productTitle,
              product_image: item.productImage,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              total_price: item.totalPrice,
            }));
            await supabase.from('order_items').insert(dbItems);
          } catch (itemErr) {
            console.warn('Could not insert order_items:', itemErr);
          }
        }
      }
    } catch (err) {
      console.warn('Order inserted locally fallback:', err);
    }

    // Save to local storage for Admin Dashboard sync
    const savedOrders = localStorage.getItem('dsp_admin_orders');
    const existingArr = savedOrders ? JSON.parse(savedOrders) : [];
    localStorage.setItem('dsp_admin_orders', JSON.stringify([newOrderRecord, ...existingArr]));

    // Dispatch event for real-time local listeners
    window.dispatchEvent(new Event('dsp_order_created'));

    if (onOrderCreated) {
      onOrderCreated(newOrderRecord);
    }

    setCreatedOrder(newOrderRecord);
    setIsSubmitting(false);
  };

  // Bank Info for Active Currency
  const currentBank = BANK_DETAILS[activeCurrency];

  // Media references (ONLY admin provided)
  const primaryImage = product.media?.primaryUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const galleryImages = product.media?.galleryUrls || [];
  const videoSource = product.media?.videoUrl;

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const constructWhatsAppMessage = () => {
    if (!createdOrder) return '';
    const bank = BANK_DETAILS[createdOrder.currency];
    const text = `Hello DSP Adire, I have completed my order request!
Order Ref: ${createdOrder.orderNumber}
Product: ${product.title} (${quantityYards} Yds - Size ${selectedSize})
Customer: ${createdOrder.customerName}
Phone: ${createdOrder.customerPhone}
Payment Option: ${effectivePaymentOption === 'pod' ? 'Pay on Delivery (Lagos State - ₦5,000 Deposit)' : 'Full Payment'}
Amount to Pay Now: ${formatCurrencyValue(payNowAmount, createdOrder.currency)}
Bank Account: ${bank.bankName} - ${bank.accountNumber} (${bank.accountName})

I will attach my payment receipt here.`;
    return `https://wa.me/2348169664607?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1B2A4A] font-sans selection:bg-[#D1B464] selection:text-[#1B2A4A]">
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* DESKTOP HEADER LAYOUT */}
          <div className="hidden md:flex items-center justify-between w-full">
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-2 text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Products Catalog</span>
            </button>

            <button
              onClick={onNavigateBack}
              className="font-serif-title text-xl font-black text-[#1B2A4A] tracking-wider cursor-pointer hover:opacity-85 transition-opacity"
            >
              DSP <span className="text-[#D1B464]">ADIRE</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Desktop Currency Dropdown */}
              <CurrencyDropdown
                activeCurrency={activeCurrency}
                onChangeCurrency={onChangeCurrency}
              />
            </div>
          </div>

          {/* MOBILE HEADER BAR */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateBack}
                className="p-2 -ml-2 text-[#1B2A4A] hover:text-[#D1B464] cursor-pointer"
                title="Back to Products Catalog"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={onNavigateBack}
                className="font-serif-title text-lg font-black text-[#1B2A4A] tracking-wider cursor-pointer"
              >
                DSP <span className="text-[#D1B464]">ADIRE</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-[#1B2A4A] hover:bg-gray-200 cursor-pointer transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateBack();
                }}
                className="w-full flex items-center gap-2 text-xs font-bold text-[#1B2A4A] p-3 rounded-2xl bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rotate-180 text-[#D1B464]" />
                <span>Back to Products Catalog</span>
              </button>

              {/* Currency Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
                  Select Currency
                </span>
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                  {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onChangeCurrency(c);
                        setMobileMenuOpen(false);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-center ${
                        activeCurrency === c ? 'bg-[#1B2A4A] text-[#D1B464] shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {CURRENCY_SYMBOLS[c]} {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump to Checkout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToCheckout();
                }}
                className="w-full py-3 rounded-2xl bg-[#D1B464] text-[#1B2A4A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Jump to Order Form</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* A. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
          {/* Left/Top: Primary Featured Image */}
          <div className="relative aspect-4/3 w-full bg-[#1B2A4A] rounded-2xl overflow-hidden shadow-lg border border-gray-100 group">
            <img
              src={primaryImage}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-[#1B2A4A]/90 text-[#D1B464] text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-[#D1B464]/30">
                {FABRIC_CATEGORY_LABELS[product.category] || product.category}
              </span>
            </div>
          </div>

          {/* Right/Bottom: Title, Fabric Type Tag, Price Tag, Quick Jump */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D1B464]">
                Hand-Dye Yoruba Luxury Piece
              </span>
              <h1 className="font-serif-title text-3xl sm:text-4xl font-black text-[#1B2A4A] leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Price Tag in Active Currency */}
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Direct-from-Factory Rate</span>
                <span className="font-serif-title text-2xl sm:text-3xl font-black text-[#1B2A4A]">
                  {formatCurrencyValue(unitPriceInCurrency, activeCurrency)}
                  <span className="text-xs font-normal text-gray-500"> per {unitLabel}</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                  {product.stockQuantity || 12} {unitAbbr(product.stockQuantity || 12)} Factory Stock
                </span>
              </div>
            </div>

            <div className="bg-[#FAFAFA] p-4 sm:p-5 rounded-2xl border border-gray-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B2A4A] block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D1B464]" />
                Product Highlights
              </span>
              <FormattedProductDescription text={product.description} compact={true} />
            </div>

            {/* Quick-Jump "Order Now" Button */}
            <button
              onClick={scrollToCheckout}
              className="w-full py-4 px-8 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider hover:bg-[#D1B464] hover:text-[#1B2A4A] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now & Claim Deposit Discount</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* B. STORYTELLING & IMAGERY (STRICT RULE: ONLY ADMIN-PROVIDED MEDIA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Story Part 1: Yoruba Heritage & Dye Craftsmanship */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center bg-[#1B2A4A] text-white rounded-3xl p-8 sm:p-12 border border-[#D1B464]/30 shadow-xl">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#D1B464] uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Yoruba Heritage & Abeokuta Dye Craftsmanship</span>
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white">
              Centuries of Organic Indigo Tradition
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Every yard of <span className="text-[#D1B464] font-semibold">{product.title}</span> undergoes an authentic hand-dye process passed down through Yoruba master artisans in Abeokuta. Using organic cassava starch paste (Eleko) and natural indigo pit fermentation, the fabric captures light with an irreplaceable depth of color and lustre that synthetic dyes can never replicate.
            </p>
          </div>

          {/* Admin Gallery Image 1 or Video if present */}
          <div className="aspect-4/3 w-full bg-black/40 rounded-2xl overflow-hidden border border-[#D1B464]/30">
            {galleryImages[0] ? (
              <img
                src={galleryImages[0]}
                alt="Craftsmanship detail 1"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : videoSource ? (
              <video
                src={videoSource}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={primaryImage}
                alt="Craftsmanship detail"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Story Part 2: Premium Drape, Weight & Care Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Admin Gallery Image 2 or Video */}
          <div className="order-2 md:order-1 aspect-4/3 w-full bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
            {galleryImages[1] ? (
              <img
                src={galleryImages[1]}
                alt="Fabric Drape Detail 2"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={primaryImage}
                alt="Fabric Detail"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="order-1 md:order-2 space-y-4">
            <span className="text-xs font-bold text-[#1B2A4A] uppercase tracking-widest">
              Lustrous Drape & Care Excellence
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-[#1B2A4A]">
              Designed for Regal Movement & Endurance
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              Crafted to balance structural silhouette with skin-breathable soft comfort. Whether tailored into traditional Agbadas, kaftans, flowing dusters, or modern luxury dresses, the material flows effortlessly with every stride.
            </p>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2 text-xs text-gray-700">
              <p className="font-bold text-[#1B2A4A] uppercase">Factory Recommended Care Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Hand wash cold with gentle organic bar soap or dry clean.</li>
                <li>Air dry in shade to preserve organic indigo brilliance.</li>
                <li>Iron on medium heat inside out.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Story Part 3: Additional Admin Media Showcase (Gallery 3 & 4 if available) */}
        {(galleryImages[2] || galleryImages[3]) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {galleryImages[2] && (
              <div className="aspect-4/3 rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={galleryImages[2]}
                  alt="Gallery Detail 3"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {galleryImages[3] && (
              <div className="aspect-4/3 rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={galleryImages[3]}
                  alt="Gallery Detail 4"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* FULL PRODUCT DETAILS & SPECIFICATION BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#1B2A4A] text-[#D1B464] flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D1B464] uppercase tracking-widest block">
                Comprehensive Overview
              </span>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-[#1B2A4A]">
                Product Features & Styling Guide
              </h2>
            </div>
          </div>

          <FormattedProductDescription text={product.description} />
        </div>
      </section>

      {/* C. EMBEDDED ORDER PROCESSING & CHECKOUT SECTION */}
      <section id="checkout-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        <div className="bg-white rounded-3xl border-2 border-[#D1B464] shadow-2xl p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-2 border-b border-gray-200 pb-6">
            <span className="px-3.5 py-1.5 rounded-full bg-[#D1B464]/20 text-[#1B2A4A] text-xs font-bold uppercase tracking-wider inline-block">
              Express Direct-from-Factory Order
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-[#1B2A4A]">
              Claim Your DSP Adire Piece
            </h2>
            <p className="text-xs text-gray-500">
              Select your specifications, calculate instant savings, and confirm your shipment.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* 1. SIZE SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">
                1. Select Size / Cut Specification
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((sz) => (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border min-h-[44px] ${
                      selectedSize === sz
                        ? 'bg-[#1B2A4A] text-[#D1B464] border-[#1B2A4A] shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#D1B464]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. QUANTITY STEPPER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between max-w-xs">
                <label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">
                  2. Quantity ({unitPlural(2)})
                </label>
                {minOrderQty > 1 && (
                  <span className="text-[11px] font-semibold text-[#D1B464]">
                    Min. order: {minOrderQty}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 bg-[#FAFAFA] p-2 rounded-2xl border border-gray-200 max-w-xs">
                <button
                  type="button"
                  disabled={quantityYards <= minOrderQty}
                  onClick={() => setQuantityYards((q) => Math.max(minOrderQty, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white text-[#1B2A4A] font-bold text-lg hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center border border-gray-200 cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-base text-[#1B2A4A]">
                  {quantityYards} {unitPlural(quantityYards)}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantityYards((q) => q + 1)}
                  className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-white font-bold text-lg hover:bg-[#23375e] flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 3. 5% LEAD COUPON FIELD */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">
                3. Lead Subscriber Coupon Code (5% Extra Discount)
              </label>
              <div className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. HERITAGE5)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1B2A4A] uppercase outline-none focus:border-[#1B2A4A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  className="px-5 py-2.5 rounded-xl bg-[#1B2A4A] text-[#FAFAFA] text-xs font-bold uppercase hover:bg-[#23375e] cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Coupon "{appliedCoupon.code}" Validated! ({appliedCoupon.discountPercent}% Discount Applied)</span>
                </p>
              )}
              {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
            </div>

            {/* 4. SHIPPING LOCATION SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">
                4. Select Shipping Location & Courier Rate
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#D1B464] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedShippingId}
                  onChange={(e) => setSelectedShippingId(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-2xl border border-gray-300 bg-white text-xs font-bold text-[#1B2A4A] outline-none focus:border-[#1B2A4A] appearance-none cursor-pointer"
                >
                  {shippingLocations.length === 0 ? (
                    <option value="">No Active Delivery Zones Configured</option>
                  ) : (
                    shippingLocations.map((loc) => {
                      let locRate = 0;
                      if (activeCurrency === 'NGN') locRate = loc.rate_ngn ?? loc.rates?.ngn ?? 0;
                      else if (activeCurrency === 'USD') locRate = loc.rate_usd ?? loc.rates?.usd ?? 0;
                      else if (activeCurrency === 'GBP') locRate = loc.rate_gbp ?? loc.rates?.gbp ?? 0;
                      else if (activeCurrency === 'EUR') locRate = loc.rate_eur ?? loc.rates?.eur ?? 0;

                      const name = loc.state_region || loc.name || 'Standard Courier';
                      const timeframe = loc.delivery_timeframe || loc.timeframe || '2-4 Days';

                      return (
                        <option key={loc.id} value={loc.id}>
                          {name} ({timeframe}) — +{formatCurrencyValue(locRate, activeCurrency)}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            </div>

            {/* 5. PAYMENT OPTION TOGGLE SWITCH */}
            <div className="space-y-4 bg-[#FAFAFA] p-6 rounded-2xl border border-gray-200">
              <label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">
                5. Select Payment Option
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OPTION 1: Pay on Delivery (Commitment Deposit - Lagos State Only) */}
                <div
                  onClick={() => {
                    if (isLagosDelivery) {
                      setPaymentOption('pod');
                    } else {
                      setPaymentOption('full');
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    !isLagosDelivery
                      ? 'bg-gray-100/80 border-gray-200 opacity-80'
                      : effectivePaymentOption === 'pod'
                      ? 'bg-white border-[#1B2A4A] shadow-md'
                      : 'bg-white/60 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1B2A4A] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#D1B464]" />
                      <span>Pay on Delivery</span>
                    </span>
                    <input
                      type="radio"
                      name="paymentOption"
                      disabled={!isLagosDelivery}
                      checked={effectivePaymentOption === 'pod'}
                      onChange={() => {
                        if (isLagosDelivery) setPaymentOption('pod');
                      }}
                      className="accent-[#1B2A4A] cursor-pointer"
                    />
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${isLagosDelivery ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'}`}>
                    {isLagosDelivery ? 'Lagos State Only (₦5,000 Deposit)' : 'Lagos State Deliveries Only'}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    {isLagosDelivery
                      ? `Pay ${formatCurrencyValue(commitmentDepositAmount, activeCurrency)} deposit now, pay remaining balance upon inspection.`
                      : 'Pay on Delivery is only available within Lagos state. Outside Lagos requires full payment before dispatch.'}
                  </p>
                  {isLagosDelivery && (
                    <div className="pt-2 text-xs font-bold text-[#1B2A4A] border-t border-gray-100">
                      Due Now: <span className="text-emerald-700">{formatCurrencyValue(commitmentDepositAmount, activeCurrency)}</span>
                    </div>
                  )}
                </div>

                {/* OPTION 2: Pay Full Amount Now (Extra 3% Discount) */}
                <div
                  onClick={() => setPaymentOption('full')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    effectivePaymentOption === 'full'
                      ? 'bg-white border-[#1B2A4A] shadow-md'
                      : 'bg-white/60 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1B2A4A] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#D1B464]" />
                      <span>Pay Full Amount Now</span>
                    </span>
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={effectivePaymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                      className="accent-[#1B2A4A] cursor-pointer"
                    />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#D1B464] text-[#1B2A4A] text-[10px] font-bold">
                    Extra 3% Instant Discount
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Priority dispatch queue & zero payment balance stress on delivery day.
                  </p>
                  <div className="pt-1 text-xs font-bold text-[#1B2A4A] border-t border-gray-100">
                    Due Now: <span className="text-emerald-700">{formatCurrencyValue(grandTotal, activeCurrency)}</span>
                  </div>
                </div>
              </div>

              {!isLagosDelivery && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <span className="font-bold">Notice:</span> Delivery location is outside Lagos State. Full payment (product total + courier fee) is required prior to shipment.
                </div>
              )}

              {/* BREAKDOWN SUMMARY BOX */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({quantityYards} {unitAbbr(quantityYards)} @ {formatCurrencyValue(unitPriceInCurrency, activeCurrency)})</span>
                  <span>{formatCurrencyValue(subtotalBeforeDiscounts, activeCurrency)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Subscriber Coupon Discount ({appliedCoupon.discountPercent}%)</span>
                    <span>-{formatCurrencyValue(couponDiscountAmount, activeCurrency)}</span>
                  </div>
                )}

                {paymentOption === 'full' && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Full Payment Discount (3%)</span>
                    <span>-{formatCurrencyValue(fullPaymentDiscountAmount, activeCurrency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Courier Shipping ({activeShippingLoc?.name})</span>
                  <span>+{formatCurrencyValue(shippingFeeInCurrency, activeCurrency)}</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between font-serif-title text-base font-black text-[#1B2A4A]">
                  <span>Order Total Value</span>
                  <span>{formatCurrencyValue(grandTotal, activeCurrency)}</span>
                </div>

                {paymentOption === 'pod' ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>1. Commitment Deposit Due Now:</span>
                      <span>{formatCurrencyValue(commitmentDepositAmount, activeCurrency)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>2. Remaining Balance on Delivery:</span>
                      <span>{formatCurrencyValue(remainingBalanceOnDelivery, activeCurrency)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                    <span className="font-bold">Total Savings Realized:</span> {formatCurrencyValue(totalDiscountAmount, activeCurrency)}
                  </div>
                )}
              </div>
            </div>

            {/* 6. BANK ACCOUNT DETAILS INSTRUCTIONS */}
            <div className="bg-[#1B2A4A] text-white p-6 rounded-2xl space-y-3 border border-[#D1B464]/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D1B464]/30 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#D1B464] shrink-0" />
                  <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-[#D1B464]">
                    GTBank Official Account Details ({activeCurrency})
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs bg-white/10 px-2.5 py-1 rounded-full text-gray-200 font-semibold tracking-wide w-fit shrink-0">
                  Verified DSP Academy LTD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Bank Name</span>
                  <span className="font-bold text-white">{currentBank.bankName}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Account Name</span>
                  <span className="font-bold text-white">{currentBank.accountName}</span>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Account Number ({currentBank.currency})</span>
                    <span className="font-mono text-base font-bold text-[#D1B464]">{currentBank.accountNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentBank.accountNumber);
                      setCopiedBank(true);
                      setTimeout(() => setCopiedBank(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Copy Account Number"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#D1B464]" />
                  </button>
                </div>
              </div>

              {copiedBank && (
                <p className="text-[10px] text-emerald-400 font-bold">GTBank Account Number Copied to Clipboard!</p>
              )}
            </div>

            {/* 7. BUYER INFORMATION INPUTS */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider block">
                7. Buyer Information & Shipping Address
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Full Name *"
                  className="px-4 py-3 rounded-xl border border-gray-300 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
                />

                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="px-4 py-3 rounded-xl border border-gray-300 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
                />

                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Phone / WhatsApp Number *"
                  className="px-4 py-3 rounded-xl border border-gray-300 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
                />

                <input
                  type="text"
                  required
                  value={buyerCity}
                  onChange={(e) => setBuyerCity(e.target.value)}
                  placeholder="City / Region *"
                  className="px-4 py-3 rounded-xl border border-gray-300 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
                />
              </div>

              <textarea
                required
                rows={2}
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="Complete Street Delivery Address *"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-5 px-3 sm:px-6 rounded-full bg-[#D1B464] text-[#1B2A4A] font-bold text-xs sm:text-sm uppercase tracking-tight sm:tracking-wider hover:bg-[#c4a453] transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[50px] sm:min-h-[54px]"
            >
              {isSubmitting ? (
                <span className="text-xs sm:text-sm">Generating Order Reference...</span>
              ) : (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-center leading-tight">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-[11px] sm:text-sm font-bold tracking-tight sm:tracking-wider">
                    Complete My Order ({formatCurrencyValue(payNowAmount, activeCurrency)} Due Now)
                  </span>
                </div>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* STYLE GALLERY SECTION */}
      {(() => {
        const rawSpecialImages = [
          product?.special_image_1,
          product?.special_image_2,
          product?.special_image_3,
          product?.special_image_4,
          product?.special_image_5,
          product?.special_image_6,
          product?.special_image_7,
          product?.special_image_8,
          product?.special_image_9,
          product?.special_image_10,
          product?.special_image_11,
          product?.special_image_12,
          product?.special_image_13,
          product?.special_image_14,
          product?.special_image_15,
        ];
        const validStyleImages = rawSpecialImages.filter(
          (img): img is string => typeof img === 'string' && img.trim().length > 0
        );

        if (validStyleImages.length === 0) return null;

        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
            <div className="text-center space-y-2 mb-10">
              <span className="text-[#D1B464] text-xs font-bold uppercase tracking-widest block">
                Editorial Lookbook
              </span>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-[#1B2A4A]">
                Style Gallery
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Curated styling inspirations and bespoke drape variations for this textile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {validStyleImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={`Style ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1B2A4A]/80 backdrop-blur-md px-3 py-1 rounded-full text-[#D1B464] text-[10px] font-bold uppercase tracking-wider border border-[#D1B464]/30">
                      Style {index + 1}
                    </div>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between border-t border-gray-100">
                    <span className="font-serif-title text-sm font-bold text-[#1B2A4A]">
                      Style {index + 1}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Look #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ORDER CONFIRMATION MODAL WITH WHATSAPP LINK */}
      <AnimatePresence>
        {createdOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1B2A4A]/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D1B464]"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                  Order Placed Successfully!
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Order Ref: <span className="font-bold text-[#1B2A4A]">{createdOrder.orderNumber}</span>
                </p>
              </div>

              <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Item:</span>
                  <span className="font-bold text-[#1B2A4A]">{product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-[#1B2A4A]">{createdOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Due Now:</span>
                  <span className="font-bold text-emerald-700">{formatCurrencyValue(payNowAmount, createdOrder.currency)}</span>
                </div>
              </div>

              <div className="bg-[#1B2A4A] text-white p-4 rounded-2xl text-xs space-y-2">
                <p className="font-bold text-[#D1B464]">Bank Transfer Details ({currentBank.currency}):</p>
                <p>Bank: {currentBank.bankName}</p>
                <p>Account Name: {currentBank.accountName}</p>
                <p className="font-mono text-sm font-bold text-[#D1B464]">
                  Account Number: {currentBank.accountNumber}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={constructWhatsAppMessage()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer text-center block"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Transaction Proof to Us</span>
                </a>

                <button
                  onClick={() => {
                    setCreatedOrder(null);
                    onNavigateBack();
                  }}
                  className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 cursor-pointer"
                >
                  Return to Video Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING NEAT SIDE TRACK ORDER CARD */}
      <FloatingTrackOrderCard onClick={() => setIsTrackerOpen(true)} />

      {/* REAL-TIME ORDER TRACKER MODAL */}
      <OrderStatusModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onNavigateToShop={onNavigateBack}
      />
    </div>
  );
};
