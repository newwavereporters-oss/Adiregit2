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
} from 'lucide-react';
import {
  Product,
  Lead,
  AdminUser,
  CurrencyCode,
  CURRENCY_SYMBOLS,
  FABRIC_CATEGORY_LABELS,
  ExchangeRates,
} from '../../types/admin';
import { INITIAL_PRODUCTS, INITIAL_LEADS, INITIAL_EXCHANGE_RATES } from '../../data/mockData';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'leads' | 'settings'>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Currency Preview Mode (NGN ₦, USD $, GBP £, EUR €)
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(INITIAL_EXCHANGE_RATES);

  // Products Data State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dsp_admin_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Leads Data State
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('dsp_admin_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  // Modal State for Products
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Filter & Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [leadSearch, setLeadSearch] = useState('');

  // Supabase Connection Status
  const [supabaseStatus, setSupabaseStatus] = useState<{ success: boolean; message: string }>({
    success: isSupabaseConfigured,
    message: isSupabaseConfigured ? 'Connected' : 'Local Persistence Active',
  });

  // Toast Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save changes to localStorage for local persistence
  useEffect(() => {
    localStorage.setItem('dsp_admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dsp_admin_leads', JSON.stringify(leads));
  }, [leads]);

  // Check Supabase connection on load
  useEffect(() => {
    testSupabaseConnection().then((res) => setSupabaseStatus(res));
  }, []);

  // Fetch from Supabase if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('products')
        .select('*')
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) {
            setProducts(data as Product[]);
          }
        });

      supabase
        .from('leads')
        .select('*')
        .then(({ data, error }) => {
          if (data && data.length > 0 && !error) {
            setLeads(data as Lead[]);
          }
        });
    }
  }, []);

  // PRODUCT CRUD HANDLERS
  const handleSaveProduct = (productData: Partial<Product>) => {
    if (productToEdit) {
      // Edit existing product
      const updatedProducts = products.map((p) =>
        p.id === productToEdit.id ? ({ ...p, ...productData } as Product) : p
      );
      setProducts(updatedProducts);
      showToast(`Product "${productData.title}" updated successfully!`);

      if (isSupabaseConfigured && supabase) {
        supabase.from('products').update(productData).eq('id', productToEdit.id);
      }
    } else {
      // Add new product
      const newProduct: Product = {
        id: `dsp-prod-${Date.now()}`,
        title: productData.title || 'Untitled Fabric',
        slug: productData.slug || 'untitled-fabric',
        description: productData.description || '',
        category: productData.category || 'adire_cotton',
        status: productData.status || 'active',
        prices: productData.prices || { ngn: 200000, usd: 150, gbp: 120, eur: 140 },
        media: productData.media || {
          primaryUrl: '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
          galleryUrls: [],
        },
        stockQuantity: productData.stockQuantity ?? 10,
        inStock: productData.inStock ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProducts([newProduct, ...products]);
      showToast(`New product "${newProduct.title}" created successfully!`);

      if (isSupabaseConfigured && supabase) {
        supabase.from('products').insert([newProduct]);
      }
    }

    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleDeleteProduct = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete product "${title}"?`)) {
      setProducts(products.filter((p) => p.id !== id));
      showToast(`Product "${title}" removed.`);

      if (isSupabaseConfigured && supabase) {
        supabase.from('products').delete().eq('id', id);
      }
    }
  };

  const handleToggleStockStatus = (id: string) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const nextInStock = !p.inStock;
        return {
          ...p,
          inStock: nextInStock,
          stockQuantity: nextInStock ? Math.max(p.stockQuantity, 1) : 0,
        };
      }
      return p;
    });
    setProducts(updated);
    showToast('Product stock status updated.');
  };

  // EXPORT LEADS TO CSV HANDLER
  const handleExportLeadsCSV = () => {
    if (leads.length === 0) {
      showToast('No subscriber leads available to export.');
      return;
    }

    const headers = ['Full Name', 'Email Address', 'WhatsApp Number', 'Discount Code', 'Fabric Preference', 'Date Subscribed', 'Status'];
    const rows = leads.map((l) => [
      `"${l.fullName}"`,
      `"${l.email}"`,
      `"${l.whatsappNumber}"`,
      `"${l.discountCode}"`,
      `"${l.fabricPreference}"`,
      `"${l.dateSubscribed}"`,
      `"${l.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dsp_adire_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported subscriber leads to CSV file!');
  };

  // Filtered lists
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
      l.whatsappNumber.includes(leadSearch)
  );

  // Overview metrics
  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const totalLeadsCount = leads.length;
  const lowStockCount = products.filter((p) => p.stockQuantity < 5 && p.stockQuantity > 0).length;
  const outOfStockCount = products.filter((p) => !p.inStock || p.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans flex flex-col relative antialiased selection:bg-[#D1B464]/30">
      
      {/* Toast Alert Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-full bg-[#1B2A4A] text-white text-xs font-semibold shadow-2xl border border-[#D1B464] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D1B464]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          1. TOP TRANSLUCENT HEADER BAR
      ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left: Mobile Drawer Trigger + Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1B2A4A] flex items-center justify-center text-[#D1B464] font-serif font-bold text-base shadow-xs">
              D
            </div>
            <div>
              <span className="font-serif-title text-xl font-bold tracking-wider text-[#1B2A4A] leading-none block">
                DSP ADIRE
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#D1B464] block -mt-0.5">
                Admin Management Suite
              </span>
            </div>
          </div>
        </div>

        {/* Center & Right Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          {/* Currency Display Selector Toggle */}
          <div className="hidden sm:flex items-center bg-[#FAFAFA] p-1 rounded-full border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2">
              Preview Currency:
            </span>
            {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((code) => (
              <button
                key={code}
                onClick={() => setActiveCurrency(code)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCurrency === code
                    ? 'bg-[#1B2A4A] text-[#D1B464] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {CURRENCY_SYMBOLS[code]} {code}
              </button>
            ))}
          </div>

          {/* Button: Storefront Preview Switch */}
          <button
            onClick={onNavigateToStorefront}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D1B464]/20 border border-[#D1B464]/40 text-[#1B2A4A] text-xs font-bold uppercase tracking-wider hover:bg-[#D1B464] hover:text-[#1B2A4A] transition-all cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span className="hidden md:inline">View Live Storefront</span>
          </button>

          {/* Admin Profile Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-xs font-bold">
              {currentUser.fullName.charAt(0)}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-[#1A1A1A] leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {currentUser.role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. BODY CONTAINER (SIDEBAR + MAIN CONTENT)
      ------------------------------------------------------------- */}
      <div className="flex flex-1 relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-[#E5E7EB] transition-all duration-300 relative z-20 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-gray-300 shadow-xs flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2 flex-1">
            {[
              { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
              { id: 'products', label: 'Product Catalog', icon: Package, badge: products.length },
              { id: 'leads', label: 'Subscribed Leads', icon: Users, badge: leads.length },
              { id: 'settings', label: 'Settings & Supabase', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B2A4A] text-[#FAFAFA] shadow-md'
                      : 'text-gray-600 hover:bg-[#FAFAFA] hover:text-[#1A1A1A]'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#D1B464]' : 'text-gray-500'}`} />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-[#D1B464] text-[#1B2A4A]' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Status Footnote */}
          {!isSidebarCollapsed && (
            <div className="p-4 m-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Database Engine
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-[#1B2A4A]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseStatus.success ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="truncate">{supabaseStatus.message}</span>
              </div>
            </div>
          )}
        </aside>

        {/* MOBILE SLIDE-OVER DRAWER */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                    <span className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                      DSP Admin Menu
                    </span>
                    <button
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-2">
                    {[
                      { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
                      { id: 'products', label: 'Product Catalog', icon: Package, badge: products.length },
                      { id: 'leads', label: 'Subscribed Leads', icon: Users, badge: leads.length },
                      { id: 'settings', label: 'Settings & Supabase', icon: Settings },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-[#1B2A4A] text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-[#D1B464]' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-800">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------------
            3. MAIN TAB CONTENT AREA
        ------------------------------------------------------------- */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Welcome Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2A4A]/10 text-[#1B2A4A] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#D1B464]" />
                    <span>Live Admin Operational Overview</span>
                  </div>
                  <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                    Welcome back, {currentUser.fullName}
                  </h1>
                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                    All DSP Adire systems operational. Monitor multi-currency catalog pricing, review homepage subscriber leads, and adjust factory inventory levels below.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsProductModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B2A4A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#23375e] shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#D1B464]" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Stat 1: Total Active Products */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Active Products
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#1B2A4A]" />
                    </div>
                  </div>
                  <p className="font-serif-title text-3xl font-bold text-[#1A1A1A]">
                    {activeProductsCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Out of {products.length} total registered catalog items
                  </p>
                </div>

                {/* Stat 2: Total Subscribed Leads */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      DSP Insider Leads
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#D1B464]/20 text-[#1B2A4A] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#1B2A4A]" />
                    </div>
                  </div>
                  <p className="font-serif-title text-3xl font-bold text-[#1A1A1A]">
                    {totalLeadsCount}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    100% Issued 15% Discount Code (DSPINSIDER15)
                  </p>
                </div>

                {/* Stat 3: Currency Converter Quick Calculator */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Currency Rates
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#D1B464]" />
                    </div>
                  </div>
                  <p className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                    $1 USD = ₦{(1 / exchangeRates.USD).toFixed(0)} NGN
                  </p>
                  <p className="text-xs text-gray-500">
                    £1 GBP = ₦{(1 / exchangeRates.GBP).toFixed(0)} | €1 EUR = ₦{(1 / exchangeRates.EUR).toFixed(0)}
                  </p>
                </div>

                {/* Stat 4: Inventory Alert Status */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Inventory Alerts
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="font-serif-title text-3xl font-bold text-[#1A1A1A]">
                    {lowStockCount + outOfStockCount}
                  </p>
                  <p className="text-xs text-amber-700 font-medium">
                    {lowStockCount} Low Stock (&lt;5 yds), {outOfStockCount} Out of Stock
                  </p>
                </div>

              </div>

              {/* Quick Products Overview Table */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif-title text-xl font-bold text-[#1A1A1A]">
                      Recent Catalog Additions
                    </h2>
                    <p className="text-xs text-gray-500">
                      Live status across all 4 luxury currencies
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] transition-colors flex items-center gap-1"
                  >
                    <span>Manage Full Catalog</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-2">Item</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-2">Price (Active Currency)</th>
                        <th className="py-3 px-2">Stock Level</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {products.slice(0, 4).map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.media.primaryUrl}
                                alt={product.title}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                              />
                              <div>
                                <span className="font-bold text-[#1A1A1A] block">
                                  {product.title}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {product.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                              {FABRIC_CATEGORY_LABELS[product.category] || product.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-bold text-[#1B2A4A]">
                            {CURRENCY_SYMBOLS[activeCurrency]}
                            {activeCurrency === 'NGN' && product.prices.ngn.toLocaleString()}
                            {activeCurrency === 'USD' && product.prices.usd}
                            {activeCurrency === 'GBP' && product.prices.gbp}
                            {activeCurrency === 'EUR' && product.prices.eur}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                product.inStock && product.stockQuantity > 5
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : product.stockQuantity > 0
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {product.stockQuantity} Yds ({product.inStock ? 'In Stock' : 'Out'})
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PRODUCT CATALOG MANAGEMENT (CRUD) */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs">
                <div>
                  <h1 className="font-serif-title text-2xl font-bold text-[#1A1A1A]">
                    Product Catalog Management (CRUD)
                  </h1>
                  <p className="text-xs text-gray-500">
                    Add, update, or archive hand-dyed Yoruba fabrics & luxury ready-to-wear pieces
                  </p>
                </div>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsProductModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B2A4A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#23375e] shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D1B464]" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by title or description..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D1B464]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] cursor-pointer"
                  >
                    <option value="all">All Fabric Categories</option>
                    {Object.entries(FABRIC_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-3xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#1B2A4A]">
                        <th className="py-4 px-4">Thumbnail & Title</th>
                        <th className="py-4 px-3">Fabric Category</th>
                        <th className="py-4 px-3">Prices (4 Currencies)</th>
                        <th className="py-4 px-3">Stock Status</th>
                        <th className="py-4 px-3 text-center">In Stock Toggle</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.media.primaryUrl}
                                alt={product.title}
                                className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <span className="font-serif-title font-bold text-sm text-[#1A1A1A] block">
                                  {product.title}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  slug: {product.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-[#1B2A4A] text-[10px] font-bold uppercase tracking-wider">
                              {FABRIC_CATEGORY_LABELS[product.category] || product.category}
                            </span>
                          </td>

                          <td className="py-4 px-3">
                            <div className="space-y-0.5 font-bold text-[11px]">
                              <p className="text-[#1B2A4A]">₦{product.prices.ngn.toLocaleString()} NGN</p>
                              <p className="text-gray-600">${product.prices.usd} USD | £{product.prices.gbp} GBP | €{product.prices.eur} EUR</p>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <span className="font-bold text-[#1A1A1A] block">
                              {product.stockQuantity} Yards / Units
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold ${
                                product.status === 'active'
                                  ? 'text-emerald-600'
                                  : product.status === 'draft'
                                  ? 'text-amber-600'
                                  : 'text-gray-400'
                              }`}
                            >
                              Status: {product.status}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-center">
                            <button
                              onClick={() => handleToggleStockStatus(product.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                product.inStock
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setProductToEdit(product);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-[#1B2A4A] hover:text-white transition-all cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(product.id, product.title)}
                                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                            No products found matching filters. Click "Add New Product" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: HOMEPAGE LEADS VIEWER */}
          {activeTab === 'leads' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs">
                <div>
                  <h1 className="font-serif-title text-2xl font-bold text-[#1A1A1A]">
                    Subscribed Leads & VIP Insider Club
                  </h1>
                  <p className="text-xs text-gray-500">
                    Full record of lead submissions from the DSP Insider lead capture gateway
                  </p>
                </div>

                <button
                  onClick={handleExportLeadsCSV}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B2A4A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#23375e] shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D1B464]" />
                  <span>Export Leads to CSV</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Filter subscriber leads by full name, email address, or WhatsApp number..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D1B464]"
                />
              </div>

              {/* Leads Table */}
              <div className="rounded-3xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#1B2A4A]">
                        <th className="py-4 px-4">Full Name</th>
                        <th className="py-4 px-3">Email Address</th>
                        <th className="py-4 px-3">WhatsApp Number</th>
                        <th className="py-4 px-3">Discount Code Issued</th>
                        <th className="py-4 px-3">Fabric Preference</th>
                        <th className="py-4 px-4 text-right">Date Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4 font-bold text-[#1A1A1A]">
                            {lead.fullName}
                          </td>

                          <td className="py-4 px-3 text-[#1B2A4A] font-medium">
                            {lead.email}
                          </td>

                          <td className="py-4 px-3 font-mono text-gray-600">
                            {lead.whatsappNumber || 'N/A'}
                          </td>

                          <td className="py-4 px-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#D1B464]/20 text-[#1B2A4A] font-mono text-[10px] font-bold">
                              {lead.discountCode} (15% OFF)
                            </span>
                          </td>

                          <td className="py-4 px-3 text-gray-700">
                            {lead.fabricPreference}
                          </td>

                          <td className="py-4 px-4 text-right text-gray-500 font-mono text-[11px]">
                            {lead.dateSubscribed}
                          </td>
                        </tr>
                      ))}

                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                            No subscriber leads found matching query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SETTINGS & SUPABASE */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
                <h1 className="font-serif-title text-2xl font-bold text-[#1A1A1A]">
                  System Settings & Supabase Auth Connection
                </h1>
                <p className="text-xs text-gray-500">
                  Manage environment integrations, master keys, and multi-currency exchange rates.
                </p>
              </div>

              {/* Supabase Status Box */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] pb-2 border-b border-gray-100">
                  Supabase Project Credentials Status
                </h2>

                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Supabase Engine Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isSupabaseConfigured
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isSupabaseConfigured ? 'Supabase Configured' : 'Local Persistence Mode'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">
                    {supabaseStatus.message}
                  </p>
                </div>
              </div>

              {/* Exchange Rates Editor */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] pb-2 border-b border-gray-100">
                  Base NGN Currency Exchange Rates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      1 NGN to USD ($)
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={exchangeRates.USD}
                      onChange={(e) =>
                        setExchangeRates({ ...exchangeRates, USD: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      1 NGN to GBP (£)
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={exchangeRates.GBP}
                      onChange={(e) =>
                        setExchangeRates({ ...exchangeRates, GBP: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      1 NGN to EUR (€)
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={exchangeRates.EUR}
                      onChange={(e) =>
                        setExchangeRates({ ...exchangeRates, EUR: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* PRODUCT MODAL COMPONENT */}
      <ProductModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
