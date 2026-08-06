import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import { OrdersSummaryCards } from './OrdersSummaryCards';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Store,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  ShoppingBag,
  Truck,
  Tag,
  MapPin,
  Clock,
  MessageSquare,
  FileText,
  Filter,
} from 'lucide-react';
import {
  Product,
  FabricCategory,
  ProductStatus,
  Lead,
  AdminUser,
  CurrencyCode,
  CURRENCY_SYMBOLS,
  FABRIC_CATEGORY_LABELS,
  ExchangeRates,
  Order,
  OrderItem,
  OrderStatus,
  ShippingLocation,
  Coupon,
  MultiCurrencyPrice,
} from '../../types/admin';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEADS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_ORDERS,
  INITIAL_SHIPPING_LOCATIONS,
  INITIAL_COUPONS,
} from '../../data/mockData';
import { ProductModal } from './ProductModal';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '../../lib/supabase';
import { mapSupabaseProductToProduct } from '../../utils/productMapper';
import { mapSupabaseShippingLocation } from '../../utils/shippingMapper';

interface AdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
  onNavigateToStorefront: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateToStorefront,
}) => {
  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'shipping' | 'coupons' | 'leads'
  >('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active Currency Preview Mode
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD');
  const currencySymbol = CURRENCY_SYMBOLS[activeCurrency];

  // DATA STATES WITH SUPABASE SYNC (Clean Slate)
  const [products, setProducts] = useState<Product[]>([]);

  const [leads, setLeads] = useState<Lead[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [shippingLocations, setShippingLocations] = useState<ShippingLocation[]>([]);

  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);

  // MODAL STATES
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderAdminNotes, setOrderAdminNotes] = useState('');

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingToEdit, setShippingToEdit] = useState<ShippingLocation | null>(null);
  const [shippingForm, setShippingForm] = useState({
    state_region: '',
    rate_ngn: 5000,
    delivery_timeframe: '24-48 Hours',
    is_active: true,
  });

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 5,
    leadEmail: 'all',
    maxUses: 100,
    isActive: true,
  });

  // SEARCH & FILTER STATES
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [couponSearch, setCouponSearch] = useState('');

  // SUPABASE CONNECTION STATUS
  const [supabaseStatus, setSupabaseStatus] = useState<{ success: boolean; message: string }>({
    success: isSupabaseConfigured,
    message: isSupabaseConfigured ? 'Connected to Supabase Live Database' : 'Supabase Not Configured',
  });

  // TOAST ALERTS
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // PURGE LEGACY LOCAL STORAGE PRODUCT CACHE ON MOUNT
  useEffect(() => {
    try {
      localStorage.removeItem('dsp_admin_products');
    } catch (_) {}
  }, []);

  // Helper to format raw order objects safely
  const formatRawOrder = (o: any): Order => {
    let rawItems: any[] = [];
    if (Array.isArray(o.items)) {
      rawItems = o.items;
    } else if (typeof o.items === 'string') {
      try {
        const parsed = JSON.parse(o.items);
        if (Array.isArray(parsed)) rawItems = parsed;
      } catch (_) {}
    } else if (Array.isArray(o.order_items)) {
      rawItems = o.order_items;
    }

    return {
      id: o.id || `ord-${Math.random()}`,
      orderNumber: o.order_number || o.orderNumber || o.id || 'DSP-0000',
      customerName: o.customer_name || o.customerName || 'N/A',
      customerEmail: o.customer_email || o.customerEmail || '',
      customerPhone: o.customer_phone || o.customerPhone || '',
      shippingAddress: o.shipping_address || o.shippingAddress || '',
      shippingCity: o.shipping_city || o.shippingCity || '',
      shippingState: o.shipping_state || o.shippingState || '',
      shippingCountry: o.shipping_country || o.shippingCountry || 'Nigeria',
      shippingLocationId: o.shipping_location_id || o.shippingLocationId,
      shippingLocationName: o.shipping_location_name || o.shippingLocationName || 'Standard Courier',
      shippingFee: Number(o.shipping_fee || o.shippingFee || 0),
      subtotalAmount: Number(o.subtotal_amount || o.subtotalAmount || o.subtotal || 0),
      discountAmount: Number(o.discount_amount || o.discountAmount || 0),
      totalAmount: Number(o.total_amount || o.totalAmount || 0),
      currency: o.currency || 'NGN',
      paymentStatus: o.payment_status || o.paymentStatus || 'unpaid',
      status: o.order_status || o.status || 'pending',
      couponCode: o.coupon_code || o.couponCode,
      adminNotes: o.admin_notes || o.adminNotes || o.notes,
      createdAt: o.created_at || o.createdAt || new Date().toISOString(),
      items: rawItems.map((it: any) => ({
        id: it.id || `it-${Math.random()}`,
        productId: it.product_id || it.productId,
        productTitle: it.product_title || it.productTitle || it.title || it.name,
        productImage: it.product_image || it.productImage || it.image,
        quantity: Number(it.quantity || it.qty || 1),
        unitPrice: Number(it.unit_price || it.unitPrice || it.price || 0),
        totalPrice: Number(it.total_price || it.totalPrice || 0),
      })),
    };
  };

  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

  // FETCH REAL PERSISTENT ORDERS FROM SUPABASE ON MOUNT / REFRESH
  const fetchOrders = async (): Promise<Order[]> => {
    setOrdersLoading(true);
    let sbOrders: Order[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: plainData, error: plainErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (plainErr) {
        console.error('Error fetching orders from Supabase:', plainErr.message);
      } else if (plainData) {
        sbOrders = plainData.map(formatRawOrder);
      }
    }

    let localOrders: Order[] = [];
    try {
      const stored = localStorage.getItem('dsp_admin_orders');
      if (stored) localOrders = JSON.parse(stored);
    } catch (_) {}

    const orderMap = new Map<string, Order>();
    localOrders.forEach((o) => {
      const key = o.orderNumber || o.id;
      if (key) orderMap.set(key, o);
    });
    sbOrders.forEach((o) => {
      const key = o.orderNumber || o.id;
      if (key) orderMap.set(key, o);
    });

    const finalOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setOrders(finalOrders);
    setOrdersLoading(false);
    return finalOrders;
  };

  const fetchAllOrdersCombined = fetchOrders;

  // Listen for local order creation events & auto-fetch on mount
  useEffect(() => {
    fetchOrders();

    const handleEvent = () => {
      fetchOrders();
    };
    window.addEventListener('dsp_order_created', handleEvent);
    return () => {
      window.removeEventListener('dsp_order_created', handleEvent);
    };
  }, []);

  // CHECK SUPABASE CONNECTION ON MOUNT
  useEffect(() => {
    testSupabaseConnection().then((res) => setSupabaseStatus(res));
  }, []);

  // CLEAR ALL PRODUCTS FROM SUPABASE & STATE (Clean Slate Handler)
  const handleClearAllProducts = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete ALL products from Supabase and clear the catalog? This will create a 100% clean slate.'
      )
    ) {
      setProducts([]);
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error('Error clearing products in Supabase:', error);
          showToast(`Failed to clear in Supabase: ${error.message}`);
        } else {
          showToast('All products deleted from Supabase! Clean slate active.');
        }
      } else {
        showToast('All products cleared locally.');
      }
    }
  };

  // FETCH & REALTIME SYNC SUPABASE DATA ACROSS DEVICES
  useEffect(() => {
    const loadAllSupabaseData = async () => {
      if (isSupabaseConfigured && supabase) {
        // Products
        const { data: pData, error: pErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (pData && !pErr) {
          setProducts(pData.map(mapSupabaseProductToProduct));
        } else if (!pErr) {
          setProducts([]);
        }

        // Leads
        const { data: lData } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (lData) setLeads(lData as Lead[]);

        // Orders
        const combinedOrders = await fetchAllOrdersCombined();
        setOrders(combinedOrders);
        // Shipping Locations
        const { data: sData } = await supabase
          .from('shipping_locations')
          .select('*')
          .order('created_at', { ascending: false });
        if (sData) {
          setShippingLocations(sData.map(mapSupabaseShippingLocation));
        }

        // Coupons
        const { data: cData } = await supabase.from('coupons').select('*');
        if (cData && cData.length > 0) {
          const formatted: Coupon[] = cData.map((c) => ({
            id: c.id,
            code: c.code,
            discountPercent: c.discount_percent,
            leadEmail: c.lead_email,
            usageCount: c.usage_count || 0,
            maxUses: c.max_uses,
            isActive: c.is_active ?? true,
            createdAt: c.created_at,
          }));
          setCoupons(formatted);
        }
      }
    };

    loadAllSupabaseData();

    // Supabase Realtime Channel
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('admin_live_data')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          async () => {
            const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (data) setProducts(data.map(mapSupabaseProductToProduct));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          async () => {
            const combinedOrders = await fetchAllOrdersCombined();
            setOrders(combinedOrders);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'shipping_locations' },
          async () => {
            const { data } = await supabase
              .from('shipping_locations')
              .select('*')
              .order('created_at', { ascending: false });
            if (data) setShippingLocations(data.map(mapSupabaseShippingLocation));
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // --- TAB A: ORDERS HANDLERS ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    showToast(`Order status updated to "${newStatus.toUpperCase()}"`);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('orders')
        .update({ order_status: newStatus, status: newStatus })
        .eq('id', orderId);
    }
  };

  const handleSaveOrderNotes = async () => {
    if (!selectedOrder) return;
    const updated = orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, adminNotes: orderAdminNotes } : o
    );
    setOrders(updated);
    setSelectedOrder({ ...selectedOrder, adminNotes: orderAdminNotes });
    showToast('Order admin notes saved!');

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('orders')
        .update({ admin_notes: orderAdminNotes })
        .eq('id', selectedOrder.id);
    }
  };

  // --- TAB B: SHIPPING LOCATIONS HANDLERS ---
  const handleOpenAddShippingModal = () => {
    setShippingToEdit(null);
    setShippingForm({
      state_region: '',
      rate_ngn: 5000,
      delivery_timeframe: '24-48 Hours',
      is_active: true,
    });
    setIsShippingModalOpen(true);
  };

  const handleOpenEditShippingModal = (loc: ShippingLocation) => {
    setShippingToEdit(loc);
    setShippingForm({
      state_region: loc.state_region || loc.name || '',
      rate_ngn: loc.rate_ngn ?? loc.rates?.ngn ?? 5000,
      delivery_timeframe: loc.delivery_timeframe || loc.timeframe || '24-48 Hours',
      is_active: loc.is_active ?? loc.isActive ?? true,
    });
    setIsShippingModalOpen(true);
  };

  const handleSaveShippingLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.state_region.trim()) {
      showToast('Please enter a State / Region name.');
      return;
    }

    const rateNgn = Math.max(0, Number(shippingForm.rate_ngn) || 0);
    const rateUsd = Math.round((rateNgn / 1600) * 100) / 100;
    const rateGbp = Math.round((rateNgn / 1900) * 100) / 100;
    const rateEur = Math.round((rateNgn / 1650) * 100) / 100;

    const locationName = shippingForm.state_region.trim() || 'Standard Delivery';
    const deliveryDays = shippingForm.delivery_timeframe.trim() || '2-4 Days';

    const payload = {
      location_name: locationName,
      state_region: locationName,
      estimated_delivery_days: deliveryDays,
      delivery_timeframe: deliveryDays,
      fee_ngn: rateNgn,
      rate_ngn: rateNgn,
      fee_usd: rateUsd,
      rate_usd: rateUsd,
      fee_gbp: rateGbp,
      rate_gbp: rateGbp,
      fee_eur: rateEur,
      rate_eur: rateEur,
      is_active: shippingForm.is_active ?? true,
    };

    try {
      if (shippingToEdit) {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('shipping_locations')
            .upsert([{ id: shippingToEdit.id, ...payload }])
            .select('*')
            .single();

          if (error) {
            console.error('Error saving shipping location:', error);
            showToast(`Error: ${error.message}`);
            return;
          }
          if (data) {
            const mapped = mapSupabaseShippingLocation(data);
            setShippingLocations(shippingLocations.map((l) => (l.id === shippingToEdit.id ? mapped : l)));
          }
        } else {
          const updatedLoc = mapSupabaseShippingLocation({ id: shippingToEdit.id, ...payload });
          setShippingLocations(shippingLocations.map((l) => (l.id === shippingToEdit.id ? updatedLoc : l)));
        }
        showToast(`Shipping zone "${payload.state_region}" updated!`);
      } else {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('shipping_locations')
            .insert([payload])
            .select('*')
            .single();

          if (error) {
            console.error('Error inserting shipping location:', error);
            showToast(`Error: ${error.message}`);
            return;
          }
          if (data) {
            const mapped = mapSupabaseShippingLocation(data);
            setShippingLocations([mapped, ...shippingLocations]);
          }
        } else {
          const newLoc = mapSupabaseShippingLocation({ id: `loc-${Date.now()}`, ...payload });
          setShippingLocations([newLoc, ...shippingLocations]);
        }
        showToast(`New shipping location "${payload.state_region}" created!`);
      }
    } catch (err: any) {
      console.error('Save shipping location failed:', err);
      showToast('Save failed.');
    }

    setIsShippingModalOpen(false);
  };

  const handleDeleteShippingLocation = async (locId: string, locName: string) => {
    if (!window.confirm(`Are you sure you want to delete shipping zone "${locName}"?`)) return;

    setShippingLocations((prev) => prev.filter((l) => l.id !== locId));
    showToast(`Shipping zone "${locName}" deleted.`);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('shipping_locations').delete().eq('id', locId);
      if (error) {
        console.error('Error deleting shipping location:', error);
      }
    }
  };

  const handleToggleShippingActive = async (locId: string, currentStatus: boolean) => {
    const updated = shippingLocations.map((loc) =>
      loc.id === locId ? { ...loc, is_active: !currentStatus, isActive: !currentStatus } : loc
    );
    setShippingLocations(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('shipping_locations')
        .update({ is_active: !currentStatus })
        .eq('id', locId);
    }
  };

  // --- TAB C: COUPON HANDLERS ---
  const handleOpenAddCouponModal = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    setCouponForm({
      code: `DSP5-${randomSuffix}`,
      discountPercent: 5,
      leadEmail: 'all',
      maxUses: 100,
      isActive: true,
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: couponForm.code.trim().toUpperCase(),
      discountPercent: couponForm.discountPercent,
      leadEmail: couponForm.leadEmail,
      usageCount: 0,
      maxUses: couponForm.maxUses,
      isActive: couponForm.isActive,
      createdAt: new Date().toISOString(),
    };

    setCoupons([newCoupon, ...coupons]);
    showToast(`Coupon "${newCoupon.code}" created successfully!`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('coupons').insert([
        {
          code: newCoupon.code,
          discount_percent: newCoupon.discountPercent,
          lead_email: newCoupon.leadEmail,
          usage_count: 0,
          max_uses: newCoupon.maxUses,
          is_active: newCoupon.isActive,
        },
      ]);
    }

    setIsCouponModalOpen(false);
  };

  const handleToggleCouponActive = async (couponId: string, currentStatus: boolean) => {
    const updated = coupons.map((c) =>
      c.id === couponId ? { ...c, isActive: !currentStatus } : c
    );
    setCoupons(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId);
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleSaveProduct = async (productData: Partial<Product>) => {
    // 1. Data Sanitization & Math
    const rawNgnInput = productData.prices?.ngn ?? 200000;
    const cleanPriceNgn = Number(String(rawNgnInput).replace(/[^0-9.]/g, '')) || 0;

    // Currency Auto-Conversion
    const computedUsd = Number((cleanPriceNgn / 1600).toFixed(2));
    const computedGbp = Number((cleanPriceNgn / 1900).toFixed(2));
    const computedEur = Number((cleanPriceNgn / 1650).toFixed(2));

    const finalPriceUsd = productData.prices?.usd || computedUsd;
    const finalPriceGbp = productData.prices?.gbp || computedGbp;
    const finalPriceEur = productData.prices?.eur || computedEur;

    // 2. Strict Enum Normalization (Ensures Postgres enum types match exactly)
    const normalizeCategory = (cat?: string): FabricCategory => {
      if (!cat) return 'adire_cotton';
      const clean = cat.toLowerCase().trim();
      if (clean.includes('tshirt') || clean.includes('t-shirt')) return 'adire_tshirts';
      if (clean.includes('silk')) return 'adire_silk';
      if (clean.includes('crepe')) return 'adire_crepe';
      if (clean.includes('chiffon')) return 'adire_chiffon';
      if (clean.includes('rayon')) return 'adire_rayon';
      if (clean.includes('viscose')) return 'adire_viscose';
      if (clean.includes('ibile')) return 'ibile';
      if (clean.includes('cotton')) return 'adire_cotton';
      if (['adire_cotton', 'adire_silk', 'adire_chiffon', 'adire_crepe', 'adire_rayon', 'adire_viscose', 'adire_tshirts', 'ibile'].includes(clean)) {
        return clean as FabricCategory;
      }
      return 'adire_cotton';
    };

    const normalizeStatus = (st?: string): ProductStatus => {
      if (!st) return 'active';
      const clean = st.toLowerCase().trim();
      if (clean.includes('draft')) return 'draft';
      if (clean.includes('archive')) return 'archived';
      return 'active';
    };

    const validatedCategory = normalizeCategory(productData.category);
    const validatedStatus = normalizeStatus(productData.status);
    const validatedUnit = (['yard', 'piece', 'set'].includes(productData.unit || '') ? productData.unit : 'piece') as any;
    const validatedMinOrderQty = Math.max(1, Number(productData.minOrderQuantity) || 1);

    // 3. Slug generation & Unique Constraint Safe Safeguards
    const rawTitle = productData.title?.trim() || 'Untitled Fabric';
    let computedSlug = (productData.slug || rawTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!computedSlug) {
      computedSlug = `adire-${Date.now()}`;
    }

    const galleryArr = productData.media?.galleryUrls || [];
    const stockQty = Number(productData.stockQuantity) || 10;
    const isStockAvailable = stockQty > 0 ? (productData.inStock ?? true) : false;

    // Construct Supabase Payload with exact matching column names and enum types
    const payload = {
      title: rawTitle,
      slug: computedSlug,
      description: productData.description || '',
      fabric_category: validatedCategory,
      status: validatedStatus,
      unit: validatedUnit,
      min_order_quantity: validatedMinOrderQty,
      price_ngn: cleanPriceNgn,
      price_usd: finalPriceUsd,
      price_gbp: finalPriceGbp,
      price_eur: finalPriceEur,
      primary_image_url: productData.media?.primaryUrl || '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
      gallery_image_url_1: galleryArr[0] || null,
      gallery_image_url_2: galleryArr[1] || null,
      gallery_image_url_3: galleryArr[2] || null,
      gallery_image_url_4: galleryArr[3] || null,
      video_url: productData.media?.videoUrl || null,
      in_stock: isStockAvailable,
      stock_quantity: stockQty,
      allow_coupons: true,
      updated_at: new Date().toISOString(),
    };

    const isUuid = productToEdit?.id
      ? /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productToEdit.id)
      : false;

    if (productToEdit && isUuid) {
      // UPDATE EXISTING REAL SUPABASE PRODUCT
      const updatedProducts = products.map((p) =>
        p.id === productToEdit.id
          ? ({
              ...p,
              ...productData,
              category: validatedCategory,
              status: validatedStatus,
              unit: validatedUnit,
              minOrderQuantity: validatedMinOrderQty,
              slug: computedSlug,
            } as Product)
          : p
      );
      setProducts(updatedProducts);

      if (isSupabaseConfigured && supabase) {
        let { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productToEdit.id)
          .select();

        // If unique slug constraint violation occurs during update
        if (
          error &&
          (error.code === '23505' ||
            error.message?.toLowerCase().includes('slug') ||
            error.message?.toLowerCase().includes('unique'))
        ) {
          const uniqueSlug = `${computedSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
          payload.slug = uniqueSlug;
          const retryRes = await supabase
            .from('products')
            .update(payload)
            .eq('id', productToEdit.id)
            .select();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (error) {
          console.error('Supabase Error updating product:', error);
          showToast(`Error: ${error.message}`);
          alert(`Failed to save to Supabase: ${error.message}`);
        } else {
          showToast(`Product "${rawTitle}" updated in Supabase!`);
          const { data: refreshed } = await supabase.from('products').select('*');
          if (refreshed && refreshed.length > 0) {
            setProducts(refreshed.map(mapSupabaseProductToProduct));
          }
        }
      } else {
        showToast(`Product "${rawTitle}" updated locally!`);
      }
    } else {
      // CREATE NEW PRODUCT OR INSERT MOCK PRODUCT TO SUPABASE
      const newId = `dsp-prod-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        title: rawTitle,
        slug: computedSlug,
        description: productData.description || '',
        category: validatedCategory,
        status: validatedStatus,
        prices: {
          ngn: cleanPriceNgn,
          usd: finalPriceUsd,
          gbp: finalPriceGbp,
          eur: finalPriceEur,
        },
        media: {
          primaryUrl: productData.media?.primaryUrl || '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
          galleryUrls: galleryArr,
          videoUrl: productData.media?.videoUrl,
        },
        stockQuantity: stockQty,
        inStock: isStockAvailable,
        unit: validatedUnit,
        minOrderQuantity: validatedMinOrderQty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProducts([newProduct, ...products]);

      if (isSupabaseConfigured && supabase) {
        // 1. Destructure and EXCLUDE 'id' property so Supabase natively generates UUIDs
        const { id: _excludedId, ...cleanPayload } = payload as Record<string, any>;

        // 2. Build explicit create payload guaranteed without any 'id' key
        const createPayload: Record<string, any> = {
          created_at: new Date().toISOString(),
          ...cleanPayload,
        };

        // 3. Direct insert to Supabase
        let { data, error } = await supabase
          .from('products')
          .insert([createPayload])
          .select();

        // Handle unique slug constraint duplicate gracefully with retry
        if (
          error &&
          (error.code === '23505' ||
            error.message?.toLowerCase().includes('slug') ||
            error.message?.toLowerCase().includes('unique'))
        ) {
          const uniqueSlug = `${computedSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
          console.warn(`Duplicate slug detected. Retrying insert with unique slug: ${uniqueSlug}`);
          createPayload.slug = uniqueSlug;
          const retryRes = await supabase
            .from('products')
            .insert([createPayload])
            .select();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (error) {
          console.error('Supabase Insert Error:', error);
          showToast(`Failed to save: ${error.message}`);
          alert(`Failed to save to Supabase: ${error.message}`);
        } else {
          console.log('Saved successfully to Supabase:', data);
          showToast(`Product "${rawTitle}" saved permanently to Supabase!`);
          // Refresh list from Supabase
          const { data: refreshed } = await supabase.from('products').select('*');
          if (refreshed && refreshed.length > 0) {
            setProducts(refreshed.map(mapSupabaseProductToProduct));
          }
        }
      } else {
        showToast(`New product "${rawTitle}" created locally!`);
      }
    }

    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setProducts(products.filter((p) => p.id !== id));

      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
      if (isSupabaseConfigured && supabase && isUuid) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Supabase Error deleting product:', error.message);
          showToast(`Error deleting from Supabase: ${error.message}`);
        } else {
          showToast(`Product "${title}" deleted from Supabase.`);
        }
      } else {
        showToast(`Product "${title}" deleted.`);
      }
    }
  };

  // FILTERED DATASETS
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredLeads = leads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.discountCode.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
      (c.leadEmail && c.leadEmail.toLowerCase().includes(couponSearch.toLowerCase()))
  );

  // METRICS COMPUTATION WITH MULTI-CURRENCY CONVERSION
  const getOrderNgnValue = (o: Order) => {
    const amt = Number(o.totalAmount || 0);
    switch (o.currency) {
      case 'USD':
        return amt * 1600;
      case 'GBP':
        return amt * 1900;
      case 'EUR':
        return amt * 1650;
      case 'NGN':
      default:
        return amt;
    }
  };

  const totalRevenueNgn = orders.reduce((sum, o) => sum + getOrderNgnValue(o), 0);

  const convertedRevenue: Record<CurrencyCode, number> = {
    NGN: Math.round(totalRevenueNgn),
    USD: Math.round((totalRevenueNgn / 1600) * 100) / 100,
    GBP: Math.round((totalRevenueNgn / 1900) * 100) / 100,
    EUR: Math.round((totalRevenueNgn / 1650) * 100) / 100,
  };

  const directRevenueByCurrency: Record<CurrencyCode, number> = {
    NGN: orders.filter((o) => o.currency === 'NGN').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    USD: orders.filter((o) => o.currency === 'USD').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    GBP: orders.filter((o) => o.currency === 'GBP').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    EUR: orders.filter((o) => o.currency === 'EUR').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  const directOrderCountsByCurrency: Record<CurrencyCode, number> = {
    NGN: orders.filter((o) => o.currency === 'NGN').length,
    USD: orders.filter((o) => o.currency === 'USD').length,
    GBP: orders.filter((o) => o.currency === 'GBP').length,
    EUR: orders.filter((o) => o.currency === 'EUR').length,
  };

  const totalRevenue = convertedRevenue[activeCurrency];
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-[#D1B464]/30 selection:text-[#1B2A4A]">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#1B2A4A] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#D1B464]/40 flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D1B464]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] text-[#D1B464] font-serif-title font-bold text-sm flex items-center justify-center shadow-xs">
              DSP
            </div>
            <div>
              <h1 className="font-serif-title text-base font-bold text-[#1B2A4A] leading-none">
                DSP Adire Admin
              </h1>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                Guild Portal
              </span>
            </div>
          </div>
        </div>

        {/* Currency Selector & Supabase Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Currency Dropdown / Switcher */}
          <div className="flex sm:hidden items-center bg-gray-100 p-0.5 rounded-full border border-gray-200">
            <select
              value={activeCurrency}
              onChange={(e) => setActiveCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-bold text-[#1B2A4A] py-1 px-2 outline-none cursor-pointer"
            >
              {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_SYMBOLS[c]} {c}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
            {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCurrency(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCurrency === c
                    ? 'bg-[#1B2A4A] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#1B2A4A]'
                }`}
              >
                {CURRENCY_SYMBOLS[c]} {c}
              </button>
            ))}
          </div>

          <div
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
              supabaseStatus.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                supabaseStatus.success ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{supabaseStatus.message}</span>
          </div>

          <button
            onClick={onNavigateToStorefront}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer min-h-[38px]"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="p-4 flex-1 space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
              { id: 'shipping', label: 'Shipping Rates', icon: Truck },
              { id: 'coupons', label: 'Coupons (5%)', icon: Tag, badge: activeCouponsCount },
              { id: 'products', label: 'Products Catalog', icon: Package, badge: products.length },
              { id: 'leads', label: 'Leads & VIPs', icon: Users, badge: leads.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B2A4A] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#1B2A4A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#D1B464]' : 'text-gray-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                  </div>
                  {!isSidebarCollapsed && tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#D1B464] text-[#1B2A4A]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="absolute top-0 left-0 bottom-0 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <span className="font-serif-title font-bold text-lg text-[#1B2A4A]">
                      Menu
                    </span>
                    <button
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    {[
                      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                      { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
                      { id: 'shipping', label: 'Shipping Rates', icon: Truck },
                      { id: 'coupons', label: 'Coupons (5%)', icon: Tag, badge: activeCouponsCount },
                      { id: 'products', label: 'Products', icon: Package, badge: products.length },
                      { id: 'leads', label: 'Leads', icon: Users, badge: leads.length },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id as any);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[#1B2A4A] text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 ${
                                isActive ? 'text-[#D1B464]' : 'text-gray-400'
                              }`}
                            />
                            <span>{tab.label}</span>
                          </div>
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                isActive
                                  ? 'bg-[#D1B464] text-[#1B2A4A]'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile Horizontal Quick Navigation Bar */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
              { id: 'shipping', label: 'Shipping', icon: Truck },
              { id: 'coupons', label: 'Coupons', icon: Tag, badge: activeCouponsCount },
              { id: 'products', label: 'Products', icon: Package, badge: products.length },
              { id: 'leads', label: 'Leads', icon: Users, badge: leads.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer min-h-[40px] ${
                    isActive
                      ? 'bg-[#1B2A4A] text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D1B464]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#D1B464] text-[#1B2A4A]' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* -------------------------------------------------------------
              TAB 1: OVERVIEW METRICS DASHBOARD
          ------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                  Guild Operations Overview
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Real-time sales performance, active lead coupons, and global shipping metrics.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Gross Revenue ({activeCurrency})
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                    {currencySymbol}
                    {totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: activeCurrency === 'NGN' ? 0 : 2,
                      maximumFractionDigits: activeCurrency === 'NGN' ? 0 : 2,
                    })}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{orders.length} Completed Orders</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Pending Orders
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-title text-2xl font-bold text-amber-600">
                    {pendingOrdersCount}
                  </p>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Awaiting Guild Dispatch
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Active Coupons
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#D1B464]/20 text-[#1B2A4A] flex items-center justify-center">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                    {activeCouponsCount}
                  </p>
                  <span className="text-[11px] text-[#D1B464] font-semibold">
                    5% Lead Conversion Codes
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Shipping Locations
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                    {shippingLocations.length}
                  </p>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Active Delivery Zones
                  </span>
                </div>
              </div>

              {/* Gross Revenue For All Currencies Panel */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#D1B464]" />
                      <span>Gross Revenue For All Currencies</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Populated with converted total order amounts across all supported global currencies.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#D1B464]" />
                    <span>Live Auto-Conversion</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((code) => {
                    const symbol = CURRENCY_SYMBOLS[code];
                    const convertedAmt = convertedRevenue[code];
                    const directAmt = directRevenueByCurrency[code];
                    const directCount = directOrderCountsByCurrency[code];
                    const isActive = activeCurrency === code;

                    const currencyNames: Record<CurrencyCode, string> = {
                      NGN: 'Nigerian Naira',
                      USD: 'US Dollar',
                      GBP: 'British Pound',
                      EUR: 'Euro',
                    };

                    const exchangeRatesLabel: Record<CurrencyCode, string> = {
                      NGN: 'Base Currency (1:1)',
                      USD: 'Rate: 1 USD = ₦1,600',
                      GBP: 'Rate: 1 GBP = ₦1,900',
                      EUR: 'Rate: 1 EUR = ₦1,650',
                    };

                    return (
                      <div
                        key={code}
                        onClick={() => setActiveCurrency(code)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isActive
                            ? 'bg-[#1B2A4A] text-white border-[#D1B464] shadow-md ring-2 ring-[#D1B464]/30'
                            : 'bg-[#FAFAFA] text-[#1A1A1A] border-gray-200 hover:border-[#1B2A4A]/30 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                                isActive ? 'bg-[#D1B464] text-[#1B2A4A]' : 'bg-[#1B2A4A]/10 text-[#1B2A4A]'
                              }`}
                            >
                              {symbol}
                            </span>
                            <div>
                              <span className={`text-xs font-bold uppercase tracking-wider block ${isActive ? 'text-[#D1B464]' : 'text-[#1B2A4A]'}`}>
                                {code}
                              </span>
                              <span className={`text-[10px] block ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                                {currencyNames[code]}
                              </span>
                            </div>
                          </div>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold bg-[#D1B464] text-[#1B2A4A] px-2.5 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className={`text-[10px] uppercase font-semibold block ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                            Gross Revenue Total
                          </span>
                          <p className={`font-serif-title text-2xl font-bold ${isActive ? 'text-white' : 'text-[#1B2A4A]'}`}>
                            {symbol}
                            {convertedAmt.toLocaleString(undefined, {
                              minimumFractionDigits: code === 'NGN' ? 0 : 2,
                              maximumFractionDigits: code === 'NGN' ? 0 : 2,
                            })}
                          </p>
                        </div>

                        <div className={`mt-4 pt-3 border-t text-[11px] space-y-1 ${isActive ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                          <div className="flex items-center justify-between">
                            <span>Direct {code} Orders:</span>
                            <span className={`font-semibold ${isActive ? 'text-[#D1B464]' : 'text-[#1B2A4A]'}`}>
                              {symbol}{directAmt.toLocaleString()} ({directCount})
                            </span>
                          </div>
                          <div className="text-[10px] opacity-75 pt-0.5">
                            {exchangeRatesLabel[code]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                    Quick Management Actions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Jump directly to your order queue, rates config, or coupon list.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2 rounded-xl bg-[#1B2A4A] text-white font-bold text-xs hover:bg-[#121E36] transition-colors cursor-pointer"
                  >
                    View Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Manage Rates
                  </button>
                  <button
                    onClick={() => setActiveTab('coupons')}
                    className="px-4 py-2 rounded-xl bg-[#D1B464]/20 text-[#1B2A4A] hover:bg-[#D1B464]/30 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Manage Coupons
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB A: ORDERS MANAGEMENT ("Orders")
          ------------------------------------------------------------- */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                    Orders & Sales Leads
                  </h2>
                  <p className="text-xs text-gray-500">
                    Real-time fulfillment, customer shipping addresses, and status controls straight from Supabase.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    showToast('Fetching latest live orders from Supabase...');
                    await fetchOrders();
                    showToast('Orders list refreshed successfully!');
                  }}
                  disabled={ordersLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2A4A] text-white font-bold text-xs hover:bg-[#121E36] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-[#D1B464] ${ordersLoading ? 'animate-spin' : ''}`} />
                  <span>🔄 Refresh Orders List</span>
                </button>
              </div>

              {/* Summary Cards: Current Month Revenue by Currency, Pending Orders, Completed Orders */}
              <OrdersSummaryCards orders={orders} />

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order # or Customer..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:border-[#D1B464] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1B2A4A] outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table (Desktop) */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#1A1A1A]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#1B2A4A]">
                            {order.orderNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-[#1A1A1A]">{order.customerName}</p>
                            <p className="text-[11px] text-gray-400">{order.customerPhone}</p>
                          </td>
                          <td className="p-4 font-bold text-[#1B2A4A]">
                            {CURRENCY_SYMBOLS[order.currency] || '$'}
                            {order.totalAmount.toLocaleString()} {order.currency}
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <PaymentStatusBadge status={order.paymentStatus} />
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <OrderStatusBadge
                              status={order.status}
                              onStatusChange={(newStatus) =>
                                handleUpdateOrderStatus(order.id, newStatus as OrderStatus)
                              }
                            />
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderAdminNotes(order.adminNotes || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#1B2A4A] text-white font-bold hover:bg-[#121E36] transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-mono font-bold text-sm text-[#1B2A4A]">
                        {order.orderNumber}
                      </span>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-[#1A1A1A]">{order.customerName}</p>
                      <p className="text-gray-500">{order.customerPhone}</p>
                      <p className="font-bold text-[#1B2A4A] pt-1">
                        Amount: {CURRENCY_SYMBOLS[order.currency] || '$'}
                        {order.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                      <OrderStatusBadge
                        status={order.status}
                        onStatusChange={(newStatus) =>
                          handleUpdateOrderStatus(order.id, newStatus as OrderStatus)
                        }
                      />

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderAdminNotes(order.adminNotes || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1B2A4A] text-white font-bold text-xs"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB B: SHIPPING LOCATIONS & RATES ("Shipping Rates")
          ------------------------------------------------------------- */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                    Shipping Locations & Rates
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure delivery zones, state/region rates in NGN (auto-calculating USD, GBP, EUR), and lead times.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddShippingModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D1B464]" />
                  <span>Add New Location</span>
                </button>
              </div>

              {shippingLocations.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
                  <Truck className="w-12 h-12 text-[#D1B464] mx-auto" />
                  <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A]">No Shipping Rates Found</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    There are currently no active shipping zones in your Supabase database. Click below to add your first zone.
                  </p>
                  <button
                    onClick={handleOpenAddShippingModal}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 text-[#D1B464]" />
                    <span>Create Shipping Zone</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shippingLocations.map((loc) => {
                    const ngnRate = loc.rate_ngn ?? loc.rates?.ngn ?? 0;
                    const usdRate = loc.rate_usd ?? loc.rates?.usd ?? Math.round((ngnRate / 1600) * 100) / 100;
                    const gbpRate = loc.rate_gbp ?? loc.rates?.gbp ?? Math.round((ngnRate / 1900) * 100) / 100;
                    const eurRate = loc.rate_eur ?? loc.rates?.eur ?? Math.round((ngnRate / 1650) * 100) / 100;
                    const isActive = loc.is_active ?? loc.isActive ?? true;
                    const regionName = loc.state_region || loc.name || 'Delivery Zone';
                    const timeframe = loc.delivery_timeframe || loc.timeframe || '2-4 Business Days';

                    return (
                      <div
                        key={loc.id}
                        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4 relative"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800">
                              {timeframe}
                            </span>
                            <button
                              onClick={() => handleToggleShippingActive(loc.id, isActive)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>

                          <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                            {regionName}
                          </h3>

                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-[#D1B464]" />
                            <span>{timeframe}</span>
                          </p>

                          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">NGN Rate (Base):</span>
                              <p className="font-bold text-[#1A1A1A]">
                                ₦{ngnRate.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">USD Rate (/1600):</span>
                              <p className="font-bold text-[#1A1A1A]">${usdRate}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">GBP Rate (/1900):</span>
                              <p className="font-bold text-[#1A1A1A]">£{gbpRate}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">EUR Rate (/1650):</span>
                              <p className="font-bold text-[#1A1A1A]">€{eurRate}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => handleOpenEditShippingModal(loc)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Zone</span>
                          </button>

                          <button
                            onClick={() => handleDeleteShippingLocation(loc.id, regionName)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB C: COUPON MANAGER ("Coupons")
          ------------------------------------------------------------- */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                    Lead Coupon Codes (5%)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Track auto-generated email lead discounts and issue custom coupons.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddCouponModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D1B464]" />
                  <span>Generate Custom Coupon</span>
                </button>
              </div>

              {/* Search */}
              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    placeholder="Search Coupon Code or Email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:border-[#D1B464] outline-none"
                  />
                </div>
              </div>

              {/* Coupons Table (Desktop) */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Target Lead / Email</th>
                      <th className="p-4">Times Used</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#1A1A1A]">
                    {filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#1B2A4A] flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[#D1B464]" />
                          <span>{coupon.code}</span>
                        </td>
                        <td className="p-4 font-bold text-[#D1B464]">
                          {coupon.discountPercent}% OFF
                        </td>
                        <td className="p-4 text-gray-600">
                          {coupon.leadEmail || 'All Storefront Visitors'}
                        </td>
                        <td className="p-4 font-bold text-gray-800">
                          {coupon.usageCount} / {coupon.maxUses || '∞'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              coupon.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleCouponActive(coupon.id, coupon.isActive)}
                            className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer min-h-[36px]"
                          >
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Coupons Mobile View (Cards) */}
              <div className="md:hidden space-y-3">
                {filteredCoupons.length === 0 ? (
                  <p className="p-6 bg-white rounded-2xl text-center text-xs text-gray-400 italic border border-gray-200">
                    No matching coupon codes found.
                  </p>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#D1B464]" />
                          <span className="font-mono font-bold text-sm text-[#1B2A4A]">
                            {coupon.code}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            coupon.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-[#D1B464]">
                          {coupon.discountPercent}% OFF DISCOUNT
                        </p>
                        <p className="text-gray-600 truncate">
                          Target: {coupon.leadEmail || 'All Storefront Visitors'}
                        </p>
                        <p className="text-gray-500">
                          Usage:{' '}
                          <span className="font-bold text-[#1B2A4A]">
                            {coupon.usageCount} / {coupon.maxUses || '∞'}
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            showToast(`Code "${coupon.code}" copied!`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-[#1B2A4A] text-xs font-bold hover:bg-gray-200 cursor-pointer min-h-[40px]"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#D1B464]" />
                          <span>Copy Code</span>
                        </button>

                        <button
                          onClick={() => handleToggleCouponActive(coupon.id, coupon.isActive)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer min-h-[40px] ${
                            coupon.isActive
                              ? 'bg-red-50 text-red-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB D: PRODUCTS CATALOG ("Products")
          ------------------------------------------------------------- */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                    Product Catalog CRUD
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage hand-dyed Adire fabrics, multi-currency prices, and gallery media.
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {products.length > 0 && (
                    <button
                      onClick={handleClearAllProducts}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      title="Delete all demo products and start clean slate"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span className="hidden sm:inline">Clear All Slate</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-[#D1B464]" />
                    <span>Add New Fabric Product</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search fabric titles..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:border-[#D1B464] outline-none"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1B2A4A] outline-none cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Fabric Categories</option>
                  {Object.entries(FABRIC_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                    <option key={catKey} value={catKey}>
                      {catLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Grid or Clean Slate View */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 my-4 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 flex items-center justify-center mx-auto text-[#1B2A4A]">
                    <Package className="w-8 h-8 text-[#D1B464]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                      Clean Slate — No Products
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      All demo products cleared! Click below to add a new product. It will save directly to Supabase and publish live across both desktop and mobile immediately.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#D1B464]" />
                    <span>Add New Fabric Product</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => {
                  const activePrice = p.prices[activeCurrency.toLowerCase() as keyof MultiCurrencyPrice] || p.prices.usd;

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4 border border-gray-100 relative group">
                          <img
                            src={p.media.primaryUrl}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#1B2A4A]/80 text-[#D1B464] text-[10px] font-bold uppercase backdrop-blur-xs">
                            {FABRIC_CATEGORY_LABELS[p.category] || p.category}
                          </span>
                        </div>

                        <h3 className="font-serif-title text-base font-bold text-[#1B2A4A] line-clamp-1">
                          {p.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {p.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                            {currencySymbol}
                            {activePrice?.toLocaleString()} {activeCurrency}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.inStock
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.inStock ? `${p.stockQuantity} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setProductToEdit(p);
                            setIsProductModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

          {/* -------------------------------------------------------------
              TAB E: LEADS CRM ("Leads")
          ------------------------------------------------------------- */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                  Email Lead Captures & VIP Coupons
                </h2>
                <p className="text-xs text-gray-500">
                  Subscribers who unlocked 5% Adire discount codes from the storefront popup.
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search Lead Name or Email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:border-[#D1B464] outline-none"
                  />
                </div>
              </div>

              {/* Leads Table (Desktop) */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">WhatsApp</th>
                      <th className="p-4">Preference</th>
                      <th className="p-4">Issued Code</th>
                      <th className="p-4">Subscribed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#1A1A1A]">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-bold text-[#1B2A4A]">{lead.fullName}</td>
                        <td className="p-4 text-gray-600">{lead.email}</td>
                        <td className="p-4 text-gray-600">
                          {lead.whatsappNumber ? (
                            <a
                              href={`https://wa.me/${lead.whatsappNumber.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{lead.whatsappNumber}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-600">{lead.fabricPreference}</td>
                        <td className="p-4 font-mono font-bold text-[#D1B464]">
                          {lead.discountCode}
                        </td>
                        <td className="p-4 text-gray-400">{lead.dateSubscribed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leads Mobile Cards View */}
              <div className="md:hidden space-y-3">
                {filteredLeads.length === 0 ? (
                  <p className="p-6 bg-white rounded-2xl text-center text-xs text-gray-400 italic border border-gray-200">
                    No matching subscriber leads found.
                  </p>
                ) : (
                  filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div>
                          <h4 className="font-bold text-sm text-[#1B2A4A]">{lead.fullName}</h4>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{lead.email}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#D1B464] px-2.5 py-1 rounded-full bg-[#D1B464]/10 border border-[#D1B464]/30">
                          {lead.discountCode}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-gray-600">
                          <span className="text-gray-400 font-medium">Preference:</span>{' '}
                          {lead.fabricPreference}
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          Subscribed: {lead.dateSubscribed}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        {lead.whatsappNumber ? (
                          <a
                            href={`https://wa.me/${lead.whatsappNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer min-h-[40px]"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Lead</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No Phone</span>
                        )}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(lead.discountCode);
                            showToast(`Code "${lead.discountCode}" copied!`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer min-h-[40px]"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#D1B464]" />
                          <span>Copy Code</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DETAILED ORDER MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#D1B464]">
                    Order Details
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                      {selectedOrder.orderNumber}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                    <OrderStatusBadge
                      status={selectedOrder.status}
                      onStatusChange={(newStatus) => {
                        handleUpdateOrderStatus(selectedOrder.id, newStatus as OrderStatus);
                        setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatus });
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Shipping Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Buyer</span>
                  <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                  <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider">
                    Shipping Address
                  </span>
                  <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedOrder.shippingAddress}</p>
                  <p className="text-gray-600">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingCountry}
                  </p>
                  <p className="text-[#1B2A4A] font-semibold mt-1">
                    Zone: {selectedOrder.shippingLocationName || 'Standard Courier'}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <h4 className="font-serif-title font-bold text-base text-[#1B2A4A]">
                  Items Purchased
                </h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-xs p-3 bg-white rounded-xl border border-gray-200"
                    >
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-[#1A1A1A]">{item.productTitle}</p>
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-bold text-[#1B2A4A]">
                        {CURRENCY_SYMBOLS[selectedOrder.currency] || '$'}
                        {item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>
                    {CURRENCY_SYMBOLS[selectedOrder.currency]}
                    {selectedOrder.subtotalAmount.toLocaleString()}
                  </span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#D1B464] font-bold">
                    <span>Discount ({selectedOrder.couponCode}):</span>
                    <span>
                      -{CURRENCY_SYMBOLS[selectedOrder.currency]}
                      {selectedOrder.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span>
                    {CURRENCY_SYMBOLS[selectedOrder.currency]}
                    {selectedOrder.shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-[#1B2A4A] pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span>
                    {CURRENCY_SYMBOLS[selectedOrder.currency]}
                    {selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}
                  </span>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
                  Admin Internal Notes
                </label>
                <textarea
                  value={orderAdminNotes}
                  onChange={(e) => setOrderAdminNotes(e.target.value)}
                  placeholder="e.g. Expedited via DHL Tracking #..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D1B464]"
                />
                <button
                  onClick={handleSaveOrderNotes}
                  className="px-4 py-2 bg-[#1B2A4A] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#121E36]"
                >
                  Save Notes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHIPPING LOCATION MODAL */}
      <AnimatePresence>
        {isShippingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                  {shippingToEdit ? 'Edit Shipping Location' : 'Add New Shipping Location'}
                </h3>
                <button
                  onClick={() => setIsShippingModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveShippingLocation} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                    State / Region Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingForm.state_region}
                    onChange={(e) => setShippingForm({ ...shippingForm, state_region: e.target.value })}
                    placeholder="e.g. Lagos Island, Abuja, UK - Standard"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-[#D1B464] outline-none font-bold text-[#1B2A4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                    Delivery Timeframe *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingForm.delivery_timeframe}
                    onChange={(e) =>
                      setShippingForm({ ...shippingForm, delivery_timeframe: e.target.value })
                    }
                    placeholder="e.g. 24-48 Hours, 3-5 Business Days"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block font-bold text-[#1B2A4A] uppercase">
                    Base NGN Rate & Auto-Calculated Currencies
                  </label>
                  <div>
                    <span className="text-gray-500 font-bold">Base Cost in NGN (₦) *</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={shippingForm.rate_ngn}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, rate_ngn: Number(e.target.value) })
                      }
                      className="w-full p-3 rounded-xl border border-gray-300 font-bold text-sm text-[#1B2A4A] outline-none focus:border-[#1B2A4A] mt-1"
                    />
                  </div>

                  {/* Auto-calculated conversions preview box */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">USD (/1600)</span>
                      <span className="font-bold text-[#1B2A4A]">
                        ${(Math.round((shippingForm.rate_ngn / 1600) * 100) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">GBP (/1900)</span>
                      <span className="font-bold text-[#1B2A4A]">
                        £{(Math.round((shippingForm.rate_ngn / 1900) * 100) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">EUR (/1650)</span>
                      <span className="font-bold text-[#1B2A4A]">
                        €{(Math.round((shippingForm.rate_ngn / 1650) * 100) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="shippingActiveToggle"
                    checked={shippingForm.is_active}
                    onChange={(e) =>
                      setShippingForm({ ...shippingForm, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1B2A4A] cursor-pointer"
                  />
                  <label htmlFor="shippingActiveToggle" className="font-bold text-[#1B2A4A] cursor-pointer">
                    Zone Active for Live Checkout
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer"
                >
                  {shippingToEdit ? 'Save Shipping Changes' : 'Create Shipping Zone'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE COUPON MODAL */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                  Generate Coupon Code
                </h3>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                    }
                    placeholder="DSP5-9X2A"
                    className="w-full p-3 rounded-xl border border-gray-200 font-mono font-bold uppercase focus:border-[#D1B464] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={couponForm.discountPercent}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })
                      }
                      className="w-full p-3 rounded-xl border outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      value={couponForm.maxUses}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, maxUses: Number(e.target.value) })
                      }
                      className="w-full p-3 rounded-xl border outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                    Target Lead Email (Optional)
                  </label>
                  <input
                    type="text"
                    value={couponForm.leadEmail}
                    onChange={(e) => setCouponForm({ ...couponForm, leadEmail: e.target.value })}
                    placeholder="all (or specific email address)"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer"
                >
                  Create & Activate Coupon
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT MODAL */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default AdminDashboard;
