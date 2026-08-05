import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  MessageSquare,
  RefreshCw,
  Sparkles,
  CreditCard,
  MapPin,
  Calendar,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Printer
} from 'lucide-react';
import {
  Order,
  OrderItem,
  OrderStatus,
  CURRENCY_SYMBOLS,
  CurrencyCode
} from '../types/admin';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  onNavigateToShop?: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
  onNavigateToShop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [statusPulse, setStatusPulse] = useState(false);

  // Auto search if initialOrderId is provided when opened
  useEffect(() => {
    if (isOpen) {
      if (initialOrderId && initialOrderId.trim().length > 0) {
        setSearchQuery(initialOrderId.trim());
        handleSearchOrder(initialOrderId.trim());
      } else {
        // Look for saved customer order in local storage
        const lastOrder = localStorage.getItem('dsp_last_customer_order_num');
        if (lastOrder && !order) {
          setSearchQuery(lastOrder);
          handleSearchOrder(lastOrder);
        }
      }
    } else {
      // Reset realtime listener on close
      setIsRealtimeActive(false);
    }
  }, [isOpen, initialOrderId]);

  // Realtime Supabase Subscription
  useEffect(() => {
    if (!isOpen || !order || !isSupabaseConfigured || !supabase) return;

    setIsRealtimeActive(true);

    // Channel subscription to listen for updates on this order
    const channel = supabase
      .channel(`order_status_${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            const updatedRow = payload.new;
            setOrder((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                status: updatedRow.status || prev.status,
                paymentStatus: updatedRow.payment_status || prev.paymentStatus,
                adminNotes: updatedRow.admin_notes ?? prev.adminNotes,
              };
            });

            // Trigger visual pulse effect
            setStatusPulse(true);
            setTimeout(() => setStatusPulse(false), 2000);
            setLastUpdatedTime(new Date().toLocaleTimeString());
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeActive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtimeActive(false);
    };
  }, [isOpen, order?.id]);

  // Main search function
  const handleSearchOrder = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) {
      setErrorMessage('Please enter an Order ID or Order Number (e.g. DSP-2026-8912)');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSearched(true);

    try {
      let foundOrder: Order | null = null;

      // 1. QUERY SUPABASE IF CONFIGURED
      if (isSupabaseConfigured && supabase) {
        // Query order by id or order_number
        const { data: dbOrders, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .or(`id.eq.${q},order_number.ilike.%${q}%`)
          .limit(1);

        if (dbOrders && dbOrders.length > 0 && !orderError) {
          const rawOrder = dbOrders[0];

          // Fetch order items from order_items table
          const { data: dbItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', rawOrder.id);

          const mappedItems: OrderItem[] = (dbItems || []).map((item: any) => ({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            productTitle: item.product_title,
            productImage: item.product_image,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price) || 0,
            totalPrice: Number(item.total_price) || 0,
          }));

          foundOrder = {
            id: rawOrder.id,
            orderNumber: rawOrder.order_number || rawOrder.id,
            customerName: rawOrder.customer_name || 'Valued Customer',
            customerEmail: rawOrder.customer_email || '',
            customerPhone: rawOrder.customer_phone || '',
            shippingAddress: rawOrder.shipping_address || '',
            shippingCity: rawOrder.shipping_city || '',
            shippingState: rawOrder.shipping_state || '',
            shippingCountry: rawOrder.shipping_country || 'Nigeria',
            shippingLocationName: rawOrder.shipping_location_name || 'Standard Courier',
            shippingFee: Number(rawOrder.shipping_fee) || 0,
            subtotalAmount: Number(rawOrder.subtotal_amount) || 0,
            discountAmount: Number(rawOrder.discount_amount) || 0,
            totalAmount: Number(rawOrder.total_amount) || 0,
            currency: (rawOrder.currency as CurrencyCode) || 'NGN',
            paymentStatus: rawOrder.payment_status || 'paid',
            status: rawOrder.status || 'pending',
            couponCode: rawOrder.coupon_code || undefined,
            adminNotes: rawOrder.admin_notes || undefined,
            createdAt: rawOrder.created_at || new Date().toISOString(),
            items: mappedItems,
          };
        }
      }

      // 2. FALLBACK TO LOCAL STORAGE
      if (!foundOrder) {
        const localOrders: Order[] = JSON.parse(
          localStorage.getItem('dsp_admin_orders') || '[]'
        );
        const match = localOrders.find(
          (o) =>
            o.id.toLowerCase() === q.toLowerCase() ||
            o.orderNumber.toLowerCase().includes(q.toLowerCase()) ||
            q.toLowerCase().includes(o.orderNumber.toLowerCase())
        );

        if (match) {
          foundOrder = match;
        }
      }

      if (foundOrder) {
        setOrder(foundOrder);
        setLastUpdatedTime(new Date().toLocaleTimeString());
        // Save to recent searches
        localStorage.setItem('dsp_last_customer_order_num', foundOrder.orderNumber);
      } else {
        setOrder(null);
        setErrorMessage(
          `No order found matching "${q}". Please double check your order receipt or confirmation email.`
        );
      }
    } catch (err: any) {
      console.error('Order status search error:', err);
      setErrorMessage('Failed to connect to order database. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOrderNum = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Stepper calculations based on status
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const currencySymbol = order ? CURRENCY_SYMBOLS[order.currency] || '₦' : '₦';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-3xl bg-[#FAFAFA] text-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden border border-[#D1B464]/30 my-8"
      >
        {/* Header Bar */}
        <div className="bg-[#1B2A4A] text-white px-5 sm:px-8 py-5 flex items-center justify-between border-b border-[#D1B464]/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D1B464]/20 border border-[#D1B464]/40 flex items-center justify-center text-[#D1B464]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold tracking-wide text-white flex items-center gap-2">
                <span>Order Status & Live Tracking</span>
              </h2>
              <p className="text-xs text-[#D1B464] font-medium tracking-wide">
                Direct Factory Production & Delivery Updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchOrder();
            }}
            className="mb-6"
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-2">
              Enter Your Unique Order ID or Order Number
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                <input
                  type="text"
                  placeholder="e.g. DSP-2026-8912 or order-172839..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#283e6b] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D1B464]" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#D1B464]" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-xs text-red-600 mt-1">
                  Tip: Order IDs are assigned immediately after checkout (e.g. DSP-2026-XXXX).
                </p>
              </div>
            </motion.div>
          )}

          {/* Empty initial state hint */}
          {!searched && !order && (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 flex items-center justify-center mx-auto mb-4 text-[#1B2A4A]">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A] mb-1">
                Real-Time Order Tracking
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 max-w-md mx-auto mb-6">
                Enter your Order Reference Number from your invoice to view crafting stage, payment status, and dispatch progress.
              </p>
              {onNavigateToShop && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToShop();
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Products Catalog</span>
                </button>
              )}
            </div>
          )}

          {/* ORDER FOUND DETAILS */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status Header Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-[#1A1A1A]/60 font-semibold uppercase tracking-wider">
                        Order Ref:
                      </span>
                      <span className="font-mono text-base font-bold text-[#1B2A4A]">
                        #{order.orderNumber}
                      </span>
                      <button
                        onClick={handleCopyOrderNum}
                        className="p-1 text-[#1A1A1A]/50 hover:text-[#1B2A4A] transition-colors cursor-pointer rounded-md hover:bg-gray-100"
                        title="Copy Order ID"
                      >
                        {copiedId ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/60 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Status */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{order.paymentStatus === 'paid' ? 'Payment Verified' : 'Payment Pending'}</span>
                    </span>

                    {/* Realtime Live Indicator */}
                    {isRealtimeActive && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 ${
                          statusPulse ? 'ring-2 ring-indigo-400 animate-pulse' : ''
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Live Sync Active</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Stepper */}
                {order.status === 'cancelled' ? (
                  <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Order Cancelled</p>
                      <p className="mt-0.5">
                        This order has been cancelled or refunded. Please contact customer support if you need further assistance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs font-bold mb-3 text-[#1A1A1A]/80">
                      <span>Order Progress</span>
                      <span className="text-[#1B2A4A] capitalize">
                        Stage: <strong className="font-bold text-[#D1B464] uppercase">{order.status}</strong>
                      </span>
                    </div>

                    <div className="relative flex items-center justify-between max-w-xl mx-auto py-2 px-2">
                      {/* Connecting Line */}
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0">
                        <div
                          className="h-full bg-[#1B2A4A] transition-all duration-500"
                          style={{
                            width:
                              currentStep === 1
                                ? '0%'
                                : currentStep === 2
                                ? '50%'
                                : '100%',
                          }}
                        />
                      </div>

                      {/* Step 1: Confirmed */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 1
                              ? 'bg-[#1B2A4A] text-[#D1B464] ring-4 ring-[#1B2A4A]/20'
                              : 'bg-gray-100 text-gray-400 border border-gray-300'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold mt-2 text-[#1A1A1A]">Received</span>
                        <span className="text-[9px] text-[#1A1A1A]/50">Order Confirmed</span>
                      </div>

                      {/* Step 2: Processing */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 2
                              ? 'bg-[#1B2A4A] text-[#D1B464] ring-4 ring-[#1B2A4A]/20'
                              : 'bg-gray-100 text-gray-400 border border-gray-300'
                          }`}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold mt-2 text-[#1A1A1A]">Processing</span>
                        <span className="text-[9px] text-[#1A1A1A]/50">Crafting Fabric</span>
                      </div>

                      {/* Step 3: Completed / Dispatched */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 4
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                              : 'bg-gray-100 text-gray-400 border border-gray-300'
                          }`}
                        >
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold mt-2 text-[#1A1A1A]">Dispatched</span>
                        <span className="text-[9px] text-[#1A1A1A]/50">Out for Delivery</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin notes if provided */}
                {order.adminNotes && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Production Update:</strong> {order.adminNotes}
                  </div>
                )}
              </div>

              {/* Items & Financial Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Items List (2 Cols) */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#1B2A4A]" />
                    <span>Ordered Products ({order.items?.length || 0})</span>
                  </h4>

                  <div className="divide-y divide-[#E5E7EB] max-h-56 overflow-y-auto pr-1">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center gap-3">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#1A1A1A] truncate">
                              {item.productTitle}
                            </h5>
                            <p className="text-[11px] text-[#1A1A1A]/60">
                              Qty: {item.quantity} × {currencySymbol}
                              {item.unitPrice.toLocaleString()}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-[#1B2A4A] shrink-0">
                            {currencySymbol}
                            {item.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 py-3">No individual items listed.</p>
                    )}
                  </div>
                </div>

                {/* Shipping & Payment Summary (1 Col) */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1B2A4A]" />
                      <span>Delivery Details</span>
                    </h4>

                    <div className="space-y-2 text-xs text-[#1A1A1A]/80 mb-4">
                      <p className="font-bold text-[#1A1A1A]">{order.customerName}</p>
                      <p>{order.shippingAddress}, {order.shippingCity}</p>
                      <p className="font-semibold text-[#1B2A4A]">{order.shippingCountry}</p>
                      <p className="text-[11px] text-[#1A1A1A]/60">Method: {order.shippingLocationName || 'Standard Courier'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#1A1A1A]/70">
                      <span>Subtotal</span>
                      <span>{currencySymbol}{order.subtotalAmount.toLocaleString()}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount ({order.couponCode})</span>
                        <span>-{currencySymbol}{order.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#1A1A1A]/70">
                      <span>Shipping Fee</span>
                      <span>{currencySymbol}{order.shippingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#1B2A4A] pt-2 border-t border-[#E5E7EB]">
                      <span>Total Paid</span>
                      <span>{currencySymbol}{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href={`https://wa.me/2348169664607?text=Hello%20DSP%20Adire,%20I%20am%20checking%20on%20my%20Order%20%23${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Support</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-gray-600" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={() => {
                      setOrder(null);
                      setSearchQuery('');
                      setSearched(false);
                      setErrorMessage(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E5E7EB] hover:bg-gray-50 text-[#1B2A4A] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Search Another Order
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
