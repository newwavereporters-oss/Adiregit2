import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  // DATA STATES WITH PERSISTENCE & SUPABASE SYNC
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dsp_admin_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('dsp_admin_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dsp_admin_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [shippingLocations, setShippingLocations] = useState<ShippingLocation[]>(() => {
    const saved = localStorage.getItem('dsp_admin_shipping');
    return saved ? JSON.parse(saved) : INITIAL_SHIPPING_LOCATIONS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('dsp_admin_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // MODAL STATES
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderAdminNotes, setOrderAdminNotes] = useState('');

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingToEdit, setShippingToEdit] = useState<ShippingLocation | null>(null);
  const [shippingForm, setShippingForm] = useState({
    name: '',
    country: 'Nigeria',
    timeframe: '2-4 Business Days',
    rates: { ngn: 5000, usd: 10, gbp: 8, eur: 9 } as MultiCurrencyPrice,
    isActive: true,
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
    message: isSupabaseConfigured ? 'Connected' : 'Local Persistence Active',
  });

  // TOAST ALERTS
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // SAVE LOCAL PERSISTENCE
  useEffect(() => {
    localStorage.setItem('dsp_admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dsp_admin_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('dsp_admin_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dsp_admin_shipping', JSON.stringify(shippingLocations));
  }, [shippingLocations]);

  useEffect(() => {
    localStorage.setItem('dsp_admin_coupons', JSON.stringify(coupons));
  }, [coupons]);

  // CHECK SUPABASE CONNECTION ON MOUNT
  useEffect(() => {
    testSupabaseConnection().then((res) => setSupabaseStatus(res));
  }, []);

  // SUPABASE HELPER TO MAP ROW TO PRODUCT
  const mapSupabaseProductToProduct = (row: any): Product => {
    const rawNgn = Number(String(row.price_ngn ?? row.prices?.ngn ?? 0).replace(/[^0-9.]/g, '')) || 0;
    const computedUsd = Number(row.price_usd) || (row.prices?.usd ? Number(row.prices.usd) : Math.round((rawNgn / 1600) * 100) / 100);
    const computedGbp = Number(row.price_gbp) || (row.prices?.gbp ? Number(row.prices.gbp) : Math.round((rawNgn / 1900) * 100) / 100);
    const computedEur = Number(row.price_eur) || (row.prices?.eur ? Number(row.prices.eur) : Math.round((rawNgn / 1650) * 100) / 100);

    const galleryList = [
      row.gallery_image_url_1,
      row.gallery_image_url_2,
      row.gallery_image_url_3,
      row.gallery_image_url_4,
    ].filter(Boolean);

    return {
      id: row.id || `dsp-prod-${Date.now()}`,
      title: row.title || 'Untitled Fabric',
      slug: row.slug || (row.title ? row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'fabric'),
      description: row.description || '',
      category: row.fabric_category || row.category || 'adire_cotton',
      status: row.status || 'active',
      prices: {
        ngn: rawNgn,
        usd: computedUsd,
        gbp: computedGbp,
        eur: computedEur,
      },
      media: {
        primaryUrl: row.primary_image_url || row.primaryUrl || '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
        galleryUrls: galleryList.length > 0 ? galleryList : (row.gallery_urls || row.media?.galleryUrls || []),
        videoUrl: row.video_url || row.videoUrl || undefined,
      },
      stockQuantity: row.stock_quantity ?? row.stockQuantity ?? 10,
      inStock: row.in_stock ?? row.inStock ?? true,
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    };
  };

  // FETCH SUPABASE DATA IF CONFIGURED
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Products
      supabase
        .from('products')
        .select('*')
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) {
            setProducts(data.map(mapSupabaseProductToProduct));
          }
        });

      // Leads
      supabase
        .from('leads')
        .select('*')
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) setLeads(data as Lead[]);
        });

      // Orders with Order Items
      supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) {
            const formatted: Order[] = data.map((o) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerName: o.customer_name,
              customerEmail: o.customer_email,
              customerPhone: o.customer_phone,
              shippingAddress: o.shipping_address,
              shippingCity: o.shipping_city,
              shippingState: o.shipping_state,
              shippingCountry: o.shipping_country,
              shippingLocationId: o.shipping_location_id,
              shippingLocationName: o.shipping_location_name,
              shippingFee: Number(o.shipping_fee || 0),
              subtotalAmount: Number(o.subtotal_amount || 0),
              discountAmount: Number(o.discount_amount || 0),
              totalAmount: Number(o.total_amount || 0),
              currency: o.currency || 'USD',
              paymentStatus: o.payment_status || 'paid',
              status: o.status || 'pending',
              couponCode: o.coupon_code,
              adminNotes: o.admin_notes,
              createdAt: o.created_at,
              items: (o.items || []).map((it: any) => ({
                id: it.id,
                orderId: it.order_id,
                productId: it.product_id,
                productTitle: it.product_title,
                productImage: it.product_image,
                quantity: it.quantity,
                unitPrice: Number(it.unit_price),
                totalPrice: Number(it.total_price),
              })),
            }));
            setOrders(formatted);
          }
        });

      // Shipping Locations
      supabase
        .from('shipping_locations')
        .select('*')
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) {
            const formatted: ShippingLocation[] = data.map((loc) => ({
              id: loc.id,
              name: loc.name,
              country: loc.country,
              timeframe: loc.timeframe,
              rates: loc.rates || { ngn: 5000, usd: 10, gbp: 8, eur: 9 },
              isActive: loc.is_active ?? true,
              createdAt: loc.created_at,
            }));
            setShippingLocations(formatted);
          }
        });

      // Coupons
      supabase
        .from('coupons')
        .select('*')
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) {
            const formatted: Coupon[] = data.map((c) => ({
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
        });
    }
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
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
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
      name: '',
      country: 'Nigeria',
      timeframe: '2-4 Business Days',
      rates: { ngn: 5000, usd: 10, gbp: 8, eur: 9 },
      isActive: true,
    });
    setIsShippingModalOpen(true);
  };

  const handleOpenEditShippingModal = (loc: ShippingLocation) => {
    setShippingToEdit(loc);
    setShippingForm({
      name: loc.name,
      country: loc.country,
      timeframe: loc.timeframe,
      rates: { ...loc.rates },
      isActive: loc.isActive,
    });
    setIsShippingModalOpen(true);
  };

  const handleSaveShippingLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name.trim()) return;

    if (shippingToEdit) {
      const updated = shippingLocations.map((loc) =>
        loc.id === shippingToEdit.id
          ? {
              ...loc,
              name: shippingForm.name,
              country: shippingForm.country,
              timeframe: shippingForm.timeframe,
              rates: shippingForm.rates,
              isActive: shippingForm.isActive,
            }
          : loc
      );
      setShippingLocations(updated);
      showToast(`Shipping zone "${shippingForm.name}" updated!`);

      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('shipping_locations')
          .update({
            name: shippingForm.name,
            country: shippingForm.country,
            timeframe: shippingForm.timeframe,
            rates: shippingForm.rates,
            is_active: shippingForm.isActive,
          })
          .eq('id', shippingToEdit.id);
      }
    } else {
      const newLoc: ShippingLocation = {
        id: `loc-${Date.now()}`,
        name: shippingForm.name,
        country: shippingForm.country,
        timeframe: shippingForm.timeframe,
        rates: shippingForm.rates,
        isActive: shippingForm.isActive,
        createdAt: new Date().toISOString(),
      };
      setShippingLocations([newLoc, ...shippingLocations]);
      showToast(`New shipping location "${newLoc.name}" created!`);

      if (isSupabaseConfigured && supabase) {
        await supabase.from('shipping_locations').insert([
          {
            id: newLoc.id,
            name: newLoc.name,
            country: newLoc.country,
            timeframe: newLoc.timeframe,
            rates: newLoc.rates,
            is_active: newLoc.isActive,
          },
        ]);
      }
    }

    setIsShippingModalOpen(false);
  };

  const handleToggleShippingActive = async (locId: string, currentStatus: boolean) => {
    const updated = shippingLocations.map((loc) =>
      loc.id === locId ? { ...loc, isActive: !currentStatus } : loc
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

    // Slug generation
    const rawTitle = productData.title?.trim() || 'Untitled Fabric';
    const computedSlug = (productData.slug || rawTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const galleryArr = productData.media?.galleryUrls || [];
    const stockQty = Number(productData.stockQuantity) || 10;
    const isStockAvailable = stockQty > 0 ? (productData.inStock ?? true) : false;

    // Construct Supabase Insert/Update Payload according to exact schema specification
    const payload = {
      title: rawTitle,
      slug: computedSlug,
      description: productData.description || '',
      fabric_category: productData.category || 'adire_cotton',
      category: productData.category || 'adire_cotton',
      status: productData.status || 'active',
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
      updated_at: new Date().toISOString(),
    };

    if (productToEdit) {
      // UPDATE EXISTING PRODUCT
      const updatedProducts = products.map((p) =>
        p.id === productToEdit.id ? ({ ...p, ...productData } as Product) : p
      );
      setProducts(updatedProducts);

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productToEdit.id);

        if (error) {
          console.error('Supabase Error updating product:', error.message);
          showToast(`Error: ${error.message}`);
          alert(`Failed to update product in Supabase: ${error.message}`);
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
      // CREATE NEW PRODUCT
      const newId = `dsp-prod-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        title: rawTitle,
        slug: computedSlug,
        description: productData.description || '',
        category: productData.category || 'adire_cotton',
        status: productData.status || 'active',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProducts([newProduct, ...products]);

      if (isSupabaseConfigured && supabase) {
        const createPayload = {
          id: newId,
          created_at: new Date().toISOString(),
          ...payload,
        };

        const { data, error } = await supabase.from('products').insert([createPayload]);

        if (error) {
          console.error('Supabase Error adding product:', error.message);
          showToast(`Failed to save: ${error.message}`);
          alert(`Failed to save product to Supabase: ${error.message}`);
        } else {
          showToast(`Product "${rawTitle}" saved successfully to Supabase!`);
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

      if (isSupabaseConfigured && supabase) {
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

  // METRICS COMPUTATION
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
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
                      Gross Revenue
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                    {currencySymbol}
                    {totalRevenue.toLocaleString()}
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
                    Orders Management
                  </h2>
                  <p className="text-xs text-gray-500">
                    Real-time fulfillment, customer shipping addresses, and status controls.
                  </p>
                </div>
              </div>

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
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value as OrderStatus
                                )
                              }
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                                order.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : order.status === 'processing'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
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
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
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
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none bg-gray-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

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
                    Configure delivery zones, multi-currency shipping fees, and lead times.
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shippingLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800">
                          {loc.country}
                        </span>
                        <button
                          onClick={() => handleToggleShippingActive(loc.id, loc.isActive)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            loc.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {loc.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <h3 className="font-serif-title text-lg font-bold text-[#1B2A4A]">
                        {loc.name}
                      </h3>

                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-[#D1B464]" />
                        <span>{loc.timeframe}</span>
                      </p>

                      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">NGN Rate:</span>
                          <p className="font-bold text-[#1A1A1A]">
                            ₦{loc.rates.ngn?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">USD Rate:</span>
                          <p className="font-bold text-[#1A1A1A]">${loc.rates.usd}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">GBP Rate:</span>
                          <p className="font-bold text-[#1A1A1A]">£{loc.rates.gbp}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">EUR Rate:</span>
                          <p className="font-bold text-[#1A1A1A]">€{loc.rates.eur}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                      <button
                        onClick={() => handleOpenEditShippingModal(loc)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Rates</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsProductModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D1B464]" />
                  <span>Add New Fabric Product</span>
                </button>
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

              {/* Products Grid */}
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
                  <h3 className="font-serif-title text-2xl font-bold text-[#1B2A4A]">
                    {selectedOrder.orderNumber}
                  </h3>
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
                    Location / Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingForm.name}
                    onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                    placeholder="e.g. Lagos Island / UK Express"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-[#D1B464] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B2A4A] uppercase mb-1">Country</label>
                    <input
                      type="text"
                      value={shippingForm.country}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, country: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B2A4A] uppercase mb-1">
                      Timeframe
                    </label>
                    <input
                      type="text"
                      value={shippingForm.timeframe}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, timeframe: e.target.value })
                      }
                      placeholder="e.g. 2-4 Business Days"
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block font-bold text-[#1B2A4A] uppercase">
                    Multi-Currency Shipping Rates
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400">NGN ₦</span>
                      <input
                        type="number"
                        value={shippingForm.rates.ngn}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            rates: { ...shippingForm.rates, ngn: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border text-xs outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-gray-400">USD $</span>
                      <input
                        type="number"
                        value={shippingForm.rates.usd}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            rates: { ...shippingForm.rates, usd: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border text-xs outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-gray-400">GBP £</span>
                      <input
                        type="number"
                        value={shippingForm.rates.gbp}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            rates: { ...shippingForm.rates, gbp: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border text-xs outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-gray-400">EUR €</span>
                      <input
                        type="number"
                        value={shippingForm.rates.eur}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            rates: { ...shippingForm.rates, eur: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="shippingActiveToggle"
                    checked={shippingForm.isActive}
                    onChange={(e) =>
                      setShippingForm({ ...shippingForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1B2A4A] cursor-pointer"
                  />
                  <label htmlFor="shippingActiveToggle" className="font-bold text-[#1B2A4A] cursor-pointer">
                    Zone Active for Checkout
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#1B2A4A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#121E36] transition-colors cursor-pointer"
                >
                  Save Shipping Zone
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
