import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Truck,
  Tag,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  CreditCard,
  Building,
} from 'lucide-react';
import {
  Product,
  CurrencyCode,
  CURRENCY_SYMBOLS,
  ShippingLocation,
  Coupon,
  Order,
  OrderItem,
} from '../types/admin';
import { INITIAL_SHIPPING_LOCATIONS, INITIAL_COUPONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapSupabaseShippingLocation } from '../utils/shippingMapper';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  activeCurrency: CurrencyCode;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  activeCurrency,
  onClearCart,
}) => {
  // Form Inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Nigeria');

  // Shipping Locations State
  const [shippingLocations, setShippingLocations] = useState<ShippingLocation[]>(INITIAL_SHIPPING_LOCATIONS);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedOrderNum, setCopiedOrderNum] = useState(false);

  // Fetch active shipping locations directly from Supabase with realtime updates
  useEffect(() => {
    let isMounted = true;

    async function loadActiveShippingLocations() {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('shipping_locations')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (isMounted) {
          if (data && !error) {
            const mapped = data.map(mapSupabaseShippingLocation);
            setShippingLocations(mapped);
            if (mapped.length > 0) {
              setSelectedLocationId((prev) => (mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
            }
          } else {
            setShippingLocations([]);
          }
        }
      } else {
        if (isMounted) setShippingLocations([]);
      }
    }

    if (isOpen) {
      loadActiveShippingLocations();
    }

    let channel: any = null;
    if (isSupabaseConfigured && supabase && isOpen) {
      channel = supabase
        .channel('checkout_shipping_live')
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
                setSelectedLocationId((prev) => (mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
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
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected Shipping Location
  const selectedLocation = shippingLocations.find((l) => l.id === selectedLocationId);

  // Helper to get currency rate key
  const currencyKey = activeCurrency.toLowerCase() as 'ngn' | 'usd' | 'gbp' | 'eur';
  const currencySymbol = CURRENCY_SYMBOLS[activeCurrency];

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.product.prices[currencyKey] || item.product.prices.usd;
    return acc + itemPrice * item.quantity;
  }, 0);

  // Discount calculation
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = subtotal - discountAmount;

  // Shipping fee calculation directly from state_region rate fields or rates object
  const getShippingFeeForLocation = (loc: ShippingLocation | undefined) => {
    if (!loc) return 0;
    if (activeCurrency === 'NGN') return loc.rate_ngn ?? loc.rates?.ngn ?? 0;
    if (activeCurrency === 'USD') return loc.rate_usd ?? loc.rates?.usd ?? 0;
    if (activeCurrency === 'GBP') return loc.rate_gbp ?? loc.rates?.gbp ?? 0;
    if (activeCurrency === 'EUR') return loc.rate_eur ?? loc.rates?.eur ?? 0;
    return loc.rate_usd ?? loc.rates?.usd ?? 0;
  };

  const shippingFee = getShippingFeeForLocation(selectedLocation);

  // Grand Total
  const grandTotal = discountedSubtotal + shippingFee;

  // Handle Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    setIsValidatingCoupon(true);

    const cleanCode = couponInput.trim().toUpperCase();

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          const matchedCoupon: Coupon = {
            id: data.id,
            code: data.code,
            discountPercent: data.discount_percent || 5,
            leadEmail: data.lead_email,
            usageCount: data.usage_count || 0,
            maxUses: data.max_uses,
            isActive: data.is_active,
            createdAt: data.created_at,
          };

          setAppliedCoupon(matchedCoupon);
          setCouponSuccess(`Applied! ${matchedCoupon.discountPercent}% Discount Deducted.`);
        } else {
          // Check local coupons fallback
          const localCoupons: Coupon[] = JSON.parse(
            localStorage.getItem('dsp_admin_coupons') || JSON.stringify(INITIAL_COUPONS)
          );
          const found = localCoupons.find((c) => c.code === cleanCode && c.isActive);

          if (found) {
            setAppliedCoupon(found);
            setCouponSuccess(`Applied! ${found.discountPercent}% Discount Deducted.`);
          } else {
            setCouponError('Invalid or expired coupon code.');
            setAppliedCoupon(null);
          }
        }
      } else {
        const localCoupons: Coupon[] = JSON.parse(
          localStorage.getItem('dsp_admin_coupons') || JSON.stringify(INITIAL_COUPONS)
        );
        const found = localCoupons.find((c) => c.code === cleanCode && c.isActive);

        if (found) {
          setAppliedCoupon(found);
          setCouponSuccess(`Applied! ${found.discountPercent}% Discount Deducted.`);
        } else {
          setCouponError('Invalid or expired coupon code.');
          setAppliedCoupon(null);
        }
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponError('Error validating coupon. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle Order Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      alert('Please fill in all required shipping details.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNum = `DSP-2026-${randomSuffix}`;

    const orderItemsPayload: OrderItem[] = cart.map((item) => {
      const unitPrice = item.product.prices[currencyKey] || item.product.prices.usd;
      return {
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.media.primaryUrl,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const orderPayload: Order = {
      id: `order-${Date.now()}`,
      orderNumber: orderNum,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingLocationId: selectedLocation?.id,
      shippingLocationName: selectedLocation?.state_region || selectedLocation?.name || 'Standard Courier',
      shippingFee,
      subtotalAmount: subtotal,
      discountAmount,
      totalAmount: grandTotal,
      currency: activeCurrency,
      paymentStatus: 'unpaid', // Recorded as unpaid lead initially
      status: 'pending',
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      createdAt: new Date().toISOString(),
      items: orderItemsPayload,
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const jsonItems = cart.map((item) => ({
          product_id: item.product.id,
          title: item.product.title,
          price: item.product.prices[currencyKey] || item.product.prices.usd,
          quantity: item.quantity,
          unit: item.product.unit || 'piece',
          primary_image_url: item.product.media?.primaryUrl,
        }));

        // Insert Order into `orders`
        const orderDbPayload = {
          order_number: orderNum,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          shipping_city: shippingCity || 'Lagos',
          shipping_state: selectedLocation?.state_region || selectedLocation?.name || shippingCity || 'Lagos',
          shipping_country: shippingCountry || 'Nigeria',
          shipping_location_id: selectedLocation?.id,
          shipping_location_name: selectedLocation?.state_region || selectedLocation?.name || 'Standard Courier',
          shipping_fee: shippingFee,
          shipping_cost: shippingFee,
          notes: '',
          subtotal: subtotal,
          subtotal_amount: subtotal,
          discount_amount: discountAmount,
          total_amount: grandTotal,
          currency: activeCurrency,
          items: jsonItems,
          payment_status: 'unpaid',
          order_status: 'pending',
          status: 'pending',
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
        };

        const { data: createdOrders, error: orderErr } = await supabase
          .from('orders')
          .insert([orderDbPayload])
          .select();

        if (orderErr) {
          console.error('FAILED TO SAVE ORDER TO DATABASE:', orderErr.message);
          alert(`Order placement failed: ${orderErr.message}`);
          setIsSubmitting(false);
          return;
        }

        const createdOrder = Array.isArray(createdOrders) ? createdOrders[0] : createdOrders;
        console.log('ORDER SAVED PERMANENTLY IN SUPABASE:', createdOrder);

        if (createdOrder) {
          // Insert items into `order_items`
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

          // Increment coupon usage if used
          if (appliedCoupon) {
            await supabase
              .from('coupons')
              .update({ usage_count: (appliedCoupon.usageCount || 0) + 1 })
              .eq('code', appliedCoupon.code);
          }
        }
      }

      // Always save order to local storage for instant dashboard parity
      const existingOrders: Order[] = JSON.parse(
        localStorage.getItem('dsp_admin_orders') || '[]'
      );
      localStorage.setItem('dsp_admin_orders', JSON.stringify([orderPayload, ...existingOrders]));

      window.dispatchEvent(new Event('dsp_order_created'));

      setCompletedOrder(orderPayload);
      onClearCart();
    } catch (err) {
      console.error('Order Submission Error:', err);
      // Fallback completion
      setCompletedOrder(orderPayload);
      onClearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderNumber = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderNumber);
      setCopiedOrderNum(true);
      setTimeout(() => setCopiedOrderNum(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FAFAFA] border-2 border-[#D1B464]/40 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-[#1B2A4A] text-white p-6 sm:p-8 flex items-center justify-between border-b border-[#D1B464]/30 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D1B464]/20 text-[#D1B464] text-xs font-bold uppercase tracking-widest mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted Checkout</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight">
              {completedOrder ? 'Order Confirmed!' : 'DSP Adire Express Checkout'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {completedOrder ? (
            /* ORDER CONFIRMATION VIEW */
            <div className="space-y-8 animate-fade-in text-center max-w-2xl mx-auto py-4">
              <div className="w-16 h-16 rounded-full bg-[#D1B464]/20 text-[#D1B464] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#D1B464]">
                  Abeokuta Guild Fulfillment Initiated
                </span>
                <h3 className="font-serif-title text-3xl font-bold text-[#1B2A4A]">
                  Thank you, {completedOrder.customerName}!
                </h3>
                <p className="text-sm text-gray-600">
                  Your luxury Adire order has been placed successfully and routed to our master artisans in Abeokuta, Ogun State.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-left space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Order Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1B2A4A] text-base">
                      {completedOrder.orderNumber}
                    </span>
                    <button
                      onClick={copyOrderNumber}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
                      title="Copy Reference Number"
                    >
                      {copiedOrderNum ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">Customer Email:</span>
                    <p className="font-semibold text-[#1A1A1A]">{completedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Phone / WhatsApp:</span>
                    <p className="font-semibold text-[#1A1A1A]">{completedOrder.customerPhone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 font-medium">Delivery Address:</span>
                    <p className="font-semibold text-[#1A1A1A]">
                      {completedOrder.shippingAddress}, {completedOrder.shippingCity} ({completedOrder.shippingLocationName})
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>
                      {currencySymbol}
                      {completedOrder.subtotalAmount.toLocaleString()}
                    </span>
                  </div>
                  {completedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-[#D1B464] font-semibold">
                      <span>Discount ({completedOrder.couponCode}):</span>
                      <span>
                        -{currencySymbol}
                        {completedOrder.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee ({completedOrder.shippingLocationName}):</span>
                    <span>
                      {currencySymbol}
                      {completedOrder.shippingFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-[#1B2A4A] pt-2 border-t border-gray-200">
                    <span>Total Paid:</span>
                    <span>
                      {currencySymbol}
                      {completedOrder.totalAmount.toLocaleString()} {completedOrder.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/2348169664607?text=${encodeURIComponent(
                    `Hello DSP Adire, I just placed order ${completedOrder.orderNumber} for ${currencySymbol}${completedOrder.totalAmount}. Kindly confirm dispatch timeframe!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] transition-all shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Transaction Proof to Us</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-all cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Customer & Shipping Details */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#1B2A4A] mb-1">
                    1. Shipping & Customer Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Enter your contact information for dispatch updates and courier delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Chief Olamide Adeyemi"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-[#D1B464] focus:ring-2 focus:ring-[#D1B464]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="olamide@fashion.ng"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-[#D1B464] focus:ring-2 focus:ring-[#D1B464]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-[#D1B464] focus:ring-2 focus:ring-[#D1B464]/20 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
                      Street Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. Plot 12 Admiralty Way, Lekki Phase 1"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-[#D1B464] focus:ring-2 focus:ring-[#D1B464]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
                      City / State
                    </label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Lagos State"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-[#D1B464] focus:ring-2 focus:ring-[#D1B464]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      placeholder="Nigeria"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-[#D1B464] focus:ring-2 focus:ring-[#D1B464]/20 outline-none"
                    />
                  </div>
                </div>

                {/* Shipping Location Dropdown */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D1B464]" />
                    <h3 className="font-serif-title text-base font-bold text-[#1B2A4A]">
                      Select Delivery Zone & Courier Speed
                    </h3>
                  </div>

                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-[#1B2A4A] focus:border-[#D1B464] outline-none cursor-pointer"
                  >
                    {shippingLocations.length === 0 ? (
                      <option value="">No Active Delivery Zones Configured</option>
                    ) : (
                      shippingLocations.map((loc) => {
                        let rateVal = 0;
                        if (activeCurrency === 'NGN') rateVal = loc.rate_ngn ?? loc.rates?.ngn ?? 0;
                        else if (activeCurrency === 'USD') rateVal = loc.rate_usd ?? loc.rates?.usd ?? 0;
                        else if (activeCurrency === 'GBP') rateVal = loc.rate_gbp ?? loc.rates?.gbp ?? 0;
                        else if (activeCurrency === 'EUR') rateVal = loc.rate_eur ?? loc.rates?.eur ?? 0;

                        const regionName = loc.state_region || loc.name || 'Standard Zone';
                        const timeframe = loc.delivery_timeframe || loc.timeframe || 'Standard Courier';

                        return (
                          <option key={loc.id} value={loc.id}>
                            {regionName} — {currencySymbol}
                            {rateVal.toLocaleString()} [{timeframe}]
                          </option>
                        );
                      })
                    )}
                  </select>

                  {selectedLocation && (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                      <span className="font-medium">Estimated Delivery Window:</span>
                      <span className="font-bold">
                        {selectedLocation.delivery_timeframe || selectedLocation.timeframe || '2-4 Business Days'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Cart Summary & Coupon */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                      Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                    </h3>
                    <ShoppingBag className="w-5 h-5 text-[#D1B464]" />
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const price = item.product.prices[currencyKey] || item.product.prices.usd;
                      return (
                        <div key={item.product.id} className="flex items-center gap-3 text-xs">
                          <img
                            src={item.product.media.primaryUrl}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1A1A1A] truncate">
                              {item.product.title}
                            </p>
                            <span className="text-gray-500">Qty: {item.quantity}</span>
                          </div>
                          <span className="font-bold text-[#1B2A4A]">
                            {currencySymbol}
                            {(price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 5% Coupon Validator */}
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
                      Have a Discount Coupon?
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="e.g. DSP5-9X2A or DSPINSIDER15"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold uppercase outline-none focus:border-[#D1B464]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#1B2A4A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#121E36] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isValidatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {couponSuccess && (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{couponSuccess}</span>
                      </p>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Fabric Subtotal:</span>
                      <span className="font-semibold text-[#1A1A1A]">
                        {currencySymbol}
                        {subtotal.toLocaleString()}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-[#D1B464] font-bold">
                        <span>
                          Coupon Discount ({appliedCoupon.code} - {appliedCoupon.discountPercent}%):
                        </span>
                        <span>
                          -{currencySymbol}
                          {discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Shipping Fee ({selectedLocation?.name || 'Standard'}):</span>
                      <span className="font-semibold text-[#1A1A1A]">
                        {currencySymbol}
                        {shippingFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-lg font-bold text-[#1B2A4A] pt-3 border-t border-gray-200">
                      <span>Total Payable:</span>
                      <span className="font-serif-title text-xl text-[#1B2A4A]">
                        {currencySymbol}
                        {grandTotal.toLocaleString()} {activeCurrency}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-4 rounded-full bg-[#D1B464] text-[#1B2A4A] font-bold text-xs uppercase tracking-widest hover:bg-[#c4a453] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-4"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#1B2A4A] border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Confirm Order ({currencySymbol}{grandTotal.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
