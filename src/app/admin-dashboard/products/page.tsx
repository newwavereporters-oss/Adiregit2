import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Image as ImageIcon,
  Check,
  Sparkles,
  Layers,
  Link,
  ChevronRight,
  Eye,
  DollarSign,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mapSupabaseProductToProduct } from '../../../utils/productMapper';
import {
  Product,
  FabricCategory,
  ProductStatus,
  ProductUnit,
  FABRIC_CATEGORY_LABELS,
  PRODUCT_UNIT_LABELS,
  CURRENCY_SYMBOLS,
} from '../../../types/admin';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FabricCategory>('adire_cotton');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [priceNGN, setPriceNGN] = useState<number>(200000);
  const [priceUSD, setPriceUSD] = useState<number>(150);
  const [priceGBP, setPriceGBP] = useState<number>(120);
  const [priceEUR, setPriceEUR] = useState<number>(140);
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [galleryUrl1, setGalleryUrl1] = useState('');
  const [galleryUrl2, setGalleryUrl2] = useState('');
  const [galleryUrl3, setGalleryUrl3] = useState('');
  const [galleryUrl4, setGalleryUrl4] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [inStock, setInStock] = useState<boolean>(true);
  const [unit, setUnit] = useState<ProductUnit>('piece');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(1);

  // 15 Special Images (Style Gallery)
  const [specialImages, setSpecialImages] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (let i = 1; i <= 15; i++) {
      init[`special_image_${i}`] = '';
    }
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error.message);
      } else if (data) {
        setProducts(data.map(mapSupabaseProductToProduct));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setCategory('adire_cotton');
    setStatus('active');
    setPriceNGN(200000);
    setPriceUSD(150);
    setPriceGBP(120);
    setPriceEUR(140);
    setPrimaryUrl('');
    setGalleryUrl1('');
    setGalleryUrl2('');
    setGalleryUrl3('');
    setGalleryUrl4('');
    setVideoUrl('');
    setStockQuantity(10);
    setInStock(true);
    setUnit('piece');
    setMinOrderQuantity(1);

    const emptySpecials: Record<string, string> = {};
    for (let i = 1; i <= 15; i++) {
      emptySpecials[`special_image_${i}`] = '';
    }
    setSpecialImages(emptySpecials);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setSlug(product.slug);
    setDescription(product.description || '');
    setCategory(product.category);
    setStatus(product.status);
    setPriceNGN(product.prices?.ngn || 200000);
    setPriceUSD(product.prices?.usd || 150);
    setPriceGBP(product.prices?.gbp || 120);
    setPriceEUR(product.prices?.eur || 140);
    setPrimaryUrl(product.media?.primaryUrl || '');
    setGalleryUrl1(product.media?.galleryUrls?.[0] || '');
    setGalleryUrl2(product.media?.galleryUrls?.[1] || '');
    setGalleryUrl3(product.media?.galleryUrls?.[2] || '');
    setGalleryUrl4(product.media?.galleryUrls?.[3] || '');
    setVideoUrl(product.media?.videoUrl || '');
    setStockQuantity(product.stockQuantity);
    setInStock(product.inStock);
    setUnit(product.unit || 'piece');
    setMinOrderQuantity(product.minOrderQuantity || 1);

    const loadedSpecials: Record<string, string> = {};
    for (let i = 1; i <= 15; i++) {
      const fieldKey = `special_image_${i}` as keyof Product;
      const val = (product[fieldKey] as string) || '';
      loadedSpecials[`special_image_${i}`] = val;
    }
    setSpecialImages(loadedSpecials);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handlePriceNgnChange = (val: string) => {
    const rawNum = Number(val.replace(/[^0-9.]/g, '')) || 0;
    setPriceNGN(rawNum);
    setPriceUSD(Math.round((rawNum / 1600) * 100) / 100);
    setPriceGBP(Math.round((rawNum / 1900) * 100) / 100);
    setPriceEUR(Math.round((rawNum / 1650) * 100) / 100);
  };

  const handleSpecialImageChange = (index: number, value: string) => {
    setSpecialImages((prev) => ({
      ...prev,
      [`special_image_${index}`]: value,
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Product title is required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Map special_image_1 through special_image_15: empty strings -> null
    const specialImagesPayload: Record<string, string | null> = {};
    for (let i = 1; i <= 15; i++) {
      const rawVal = specialImages[`special_image_${i}`];
      specialImagesPayload[`special_image_${i}`] =
        rawVal && rawVal.trim() !== '' ? rawVal.trim() : null;
    }

    const payload: any = {
      title: title.trim(),
      slug: generatedSlug,
      description: description.trim(),
      fabric_category: category,
      category: category,
      status: status,
      price_ngn: priceNGN,
      price_usd: priceUSD,
      price_gbp: priceGBP,
      price_eur: priceEUR,
      primary_image_url: primaryUrl.trim() || null,
      gallery_image_url_1: galleryUrl1.trim() || null,
      gallery_image_url_2: galleryUrl2.trim() || null,
      gallery_image_url_3: galleryUrl3.trim() || null,
      gallery_image_url_4: galleryUrl4.trim() || null,
      video_url: videoUrl.trim() || null,
      stock_quantity: stockQuantity,
      in_stock: inStock,
      unit: unit,
      min_order_quantity: minOrderQuantity,
      updated_at: new Date().toISOString(),
      ...specialImagesPayload,
    };

    if (isSupabaseConfigured && supabase) {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('Error updating product in Supabase:', error.message);
          setErrorMsg(`Failed to update product: ${error.message}`);
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);

        if (error) {
          console.error('Error creating product in Supabase:', error.message);
          setErrorMsg(`Failed to create product: ${error.message}`);
          setSaving(false);
          return;
        }
      }
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setIsModalOpen(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert(`Failed to delete product: ${error.message}`);
        return;
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1B2A4A] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span>Admin Dashboard</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="font-bold text-[#1B2A4A]">Products</span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
              Product Management & Style Gallery
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage luxury Yoruba textiles, multi-currency prices, and 15-image style galleries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="p-3 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[#1B2A4A] transition-colors cursor-pointer"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-2xl bg-[#1B2A4A] text-[#D1B464] text-xs font-bold uppercase tracking-wider hover:bg-[#25375c] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title or slug..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white rounded-2xl border border-gray-200 text-xs font-bold text-[#1B2A4A] outline-none cursor-pointer"
          >
            <option value="all">All Fabric Categories</option>
            {Object.entries(FABRIC_CATEGORY_LABELS).map(([catKey, catLabel]) => (
              <option key={catKey} value={catKey}>
                {catLabel}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT TABLE / LIST */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
              Loading Product Records...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm font-bold text-[#1B2A4A]">No products found</p>
              <p className="text-xs text-gray-500">Try adjusting your filters or create a new product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (NGN)</th>
                    <th className="p-4">Price (USD)</th>
                    <th className="p-4">Style Images</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredProducts.map((p) => {
                    const styleCount = [
                      p.special_image_1,
                      p.special_image_2,
                      p.special_image_3,
                      p.special_image_4,
                      p.special_image_5,
                      p.special_image_6,
                      p.special_image_7,
                      p.special_image_8,
                      p.special_image_9,
                      p.special_image_10,
                      p.special_image_11,
                      p.special_image_12,
                      p.special_image_13,
                      p.special_image_14,
                      p.special_image_15,
                    ].filter((img) => img && typeof img === 'string' && img.trim() !== '').length;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                p.media?.primaryUrl ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                            />
                            <div>
                              <p className="font-bold text-[#1B2A4A]">{p.title}</p>
                              <p className="text-[10px] text-gray-400 font-mono">/{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold">
                            {FABRIC_CATEGORY_LABELS[p.category] || p.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[#1B2A4A]">
                          ₦{p.prices?.ngn?.toLocaleString() || '0'}
                        </td>
                        <td className="p-4 font-bold text-emerald-700">
                          ${p.prices?.usd || '0'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              styleCount > 0
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {styleCount} / 15 Styles
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/products/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                              title="View Sales Page"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-[#1B2A4A] transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-serif-title text-xl font-bold text-[#1B2A4A]">
                  {editingProduct ? 'Edit Textile Product' : 'Add New Textile Product'}
                </h2>
                <p className="text-xs text-gray-500">
                  Configure pricing, media links, and 15 optional Style Gallery images.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* BASIC DETAILS */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D1B464]">
                  1. Product Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingProduct) {
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)+/g, '')
                          );
                        }
                      }}
                      placeholder="e.g. Royal Olokun Agbada Ensemble"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#1B2A4A]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. royal-olokun-agbada-ensemble"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-[#1B2A4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product details and heritage description..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#1B2A4A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Fabric Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FabricCategory)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none cursor-pointer"
                    >
                      {Object.entries(FABRIC_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                        <option key={catKey} value={catKey}>
                          {catLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProductStatus)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Unit Type
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as ProductUnit)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none cursor-pointer"
                    >
                      {Object.entries(PRODUCT_UNIT_LABELS).map(([uKey, uLabel]) => (
                        <option key={uKey} value={uKey}>
                          {uLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* MULTI-CURRENCY PRICES */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D1B464]">
                  2. Pricing & Currency Rates
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Price (NGN ₦) *
                    </label>
                    <input
                      type="number"
                      required
                      value={priceNGN}
                      onChange={(e) => handlePriceNgnChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#1B2A4A] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Price (USD $)
                    </label>
                    <input
                      type="number"
                      value={priceUSD}
                      onChange={(e) => setPriceUSD(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-emerald-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Price (GBP £)
                    </label>
                    <input
                      type="number"
                      value={priceGBP}
                      onChange={(e) => setPriceGBP(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-blue-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Price (EUR €)
                    </label>
                    <input
                      type="number"
                      value={priceEUR}
                      onChange={(e) => setPriceEUR(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-indigo-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* MEDIA LINKS */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D1B464]">
                  3. Primary Image & Video Media
                </h3>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="url"
                    value={primaryUrl}
                    onChange={(e) => setPrimaryUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#1B2A4A]"
                  />
                </div>
              </div>

              {/* 15 SPECIAL IMAGES (STYLE GALLERY) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D1B464]">
                      4. Style Gallery (15 Optional Image URLs)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Enter up to 15 optional image URLs (`special_image_1` to `special_image_15`). Non-empty inputs are saved, empty inputs map to null.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
                    const key = `special_image_${num}`;
                    const val = specialImages[key] || '';
                    return (
                      <div key={key} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                          <span>Style Image {num} (`{key}`)</span>
                          {val.trim() !== '' && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              Valid URL
                            </span>
                          )}
                        </label>
                        <input
                          type="url"
                          value={val}
                          onChange={(e) => handleSpecialImageChange(num, e.target.value)}
                          placeholder={`https://.../style-${num}.jpg`}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-[#1B2A4A]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-[#1B2A4A] text-[#D1B464] font-bold text-xs uppercase tracking-wider hover:bg-[#25375c] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <span>Saving Product...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Product Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
