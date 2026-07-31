import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  Video,
  DollarSign,
  Package,
  Check,
  Sparkles,
  Layers,
  AlertCircle,
  Eye,
  Link,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Product,
  FabricCategory,
  ProductStatus,
  ProductUnit,
  FABRIC_CATEGORY_LABELS,
  PRODUCT_UNIT_LABELS,
  CURRENCY_SYMBOLS,
} from '../../types/admin';

interface ProductModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FabricCategory>('adire_crepe');
  const [status, setStatus] = useState<ProductStatus>('active');

  // Multi-Currency Prices
  const [priceNGN, setPriceNGN] = useState<number>(200000);
  const [priceUSD, setPriceUSD] = useState<number>(150);
  const [priceGBP, setPriceGBP] = useState<number>(120);
  const [priceEUR, setPriceEUR] = useState<number>(140);

  // Media Links (Strictly URL inputs)
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [galleryUrl1, setGalleryUrl1] = useState('');
  const [galleryUrl2, setGalleryUrl2] = useState('');
  const [galleryUrl3, setGalleryUrl3] = useState('');
  const [galleryUrl4, setGalleryUrl4] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Inventory, Units & Stock
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [inStock, setInStock] = useState<boolean>(true);
  const [unit, setUnit] = useState<ProductUnit>('piece');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(1);
  const [allowCoupons, setAllowCoupons] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto NGN currency conversion handler
  const handlePriceNgnChange = (val: string) => {
    const rawNum = Number(val.replace(/[^0-9.]/g, '')) || 0;
    setPriceNGN(rawNum);
    setPriceUSD(Math.round((rawNum / 1600) * 100) / 100);
    setPriceGBP(Math.round((rawNum / 1900) * 100) / 100);
    setPriceEUR(Math.round((rawNum / 1650) * 100) / 100);
  };

  // Auto-generate slug when title changes (if user hasn't typed custom slug)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!productToEdit) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Populate data when editing an existing product
  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setSlug(productToEdit.slug);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setStatus(productToEdit.status);

      setPriceNGN(productToEdit.prices.ngn);
      setPriceUSD(productToEdit.prices.usd);
      setPriceGBP(productToEdit.prices.gbp);
      setPriceEUR(productToEdit.prices.eur);

      setPrimaryUrl(productToEdit.media.primaryUrl || '');
      setGalleryUrl1(productToEdit.media.galleryUrls[0] || '');
      setGalleryUrl2(productToEdit.media.galleryUrls[1] || '');
      setGalleryUrl3(productToEdit.media.galleryUrls[2] || '');
      setGalleryUrl4(productToEdit.media.galleryUrls[3] || '');
      setVideoUrl(productToEdit.media.videoUrl || '');

      setStockQuantity(productToEdit.stockQuantity);
      setInStock(productToEdit.inStock);
      setUnit(productToEdit.unit || 'piece');
      setMinOrderQuantity(productToEdit.minOrderQuantity || 1);
    } else {
      // Default reset for new product
      setTitle('');
      setSlug('');
      setDescription('');
      setCategory('adire_cotton');
      setStatus('active');

      setPriceNGN(250000);
      setPriceUSD(156.25);
      setPriceGBP(131.58);
      setPriceEUR(151.52);

      setPrimaryUrl('/src/assets/images/adire_hero_fashion_1785421009712.jpg');
      setGalleryUrl1('/src/assets/images/adire_artisan_craft_1785421029164.jpg');
      setGalleryUrl2('/src/assets/images/adire_fabric_swatch_1785421041385.jpg');
      setGalleryUrl3('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
      setGalleryUrl4('');
      setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');

      setStockQuantity(12);
      setInStock(true);
      setUnit('piece');
      setMinOrderQuantity(1);
      setAllowCoupons(true);
    }
  }, [productToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const galleryUrls = [galleryUrl1, galleryUrl2, galleryUrl3, galleryUrl4].filter(
        (url) => url.trim().length > 0
      );

      const cleanNgn = Number(String(priceNGN).replace(/[^0-9.]/g, '')) || 0;
      const computedUsd = Number(priceUSD) || Math.round((cleanNgn / 1600) * 100) / 100;
      const computedGbp = Number(priceGBP) || Math.round((cleanNgn / 1900) * 100) / 100;
      const computedEur = Number(priceEUR) || Math.round((cleanNgn / 1650) * 100) / 100;

      const autoSlug = (slug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const productPayload: Partial<Product> = {
        title,
        slug: autoSlug,
        description,
        category,
        status,
        prices: {
          ngn: cleanNgn,
          usd: computedUsd,
          gbp: computedGbp,
          eur: computedEur,
        },
        media: {
          primaryUrl: primaryUrl || '/src/assets/images/adire_hero_fashion_1785421009712.jpg',
          galleryUrls,
          videoUrl: videoUrl || undefined,
        },
        stockQuantity: Number(stockQuantity) || 0,
        inStock: stockQuantity > 0 ? inStock : false,
        unit,
        minOrderQuantity: Math.max(1, Number(minOrderQuantity) || 1),
        updatedAt: new Date().toISOString(),
      };

      await onSave(productPayload);
    } catch (err: any) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl border border-[#E5E7EB] w-full max-w-4xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-[#FAFAFA] border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1B2A4A] text-[#D1B464] flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-title text-xl font-bold text-[#1A1A1A]">
                  {productToEdit ? 'Edit Fabric Product' : 'Add New DSP Adire Product'}
                </h2>
                <p className="text-xs text-[#1A1A1A]/60">
                  Configure titles, multi-currency prices, media links & inventory levels
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body - Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 overflow-y-auto">
            {/* SECTION 1: General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] pb-2 border-b border-gray-100 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>1. General Product Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Royal Abeokuta Crepe Agbada"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="royal-abeokuta-crepe-agbada"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm font-mono text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide artisan details, dye technique, weave weight, and garment styling instructions..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Fabric Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FabricCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white cursor-pointer"
                  >
                    {Object.entries(FABRIC_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Product Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white cursor-pointer"
                  >
                    <option value="active">Active (Visible in Storefront)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: Multi-Currency Pricing */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] pb-2 border-b border-gray-100 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>2. Multi-Currency Pricing Setup</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Price (NGN ₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceNGN}
                    onChange={(e) => handlePriceNgnChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-sm font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Price (USD $) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-sm font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Price (GBP £) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceGBP}
                    onChange={(e) => setPriceGBP(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-sm font-bold text-[#1A1A1A]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                  <label className="block text-xs font-bold text-[#1B2A4A] mb-1">
                    Price (EUR €) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceEUR}
                    onChange={(e) => setPriceEUR(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-sm font-bold text-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Media Links & Live Thumbnail/Video Previews */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D1B464]" />
                  <span>3. Media Links & Live Previews (URL Links)</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#D1B464]">
                  URL Inputs with Real-Time Preview
                </span>
              </h3>

              {/* Primary Image */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  Primary Image URL *
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    required
                    value={primaryUrl}
                    onChange={(e) => setPrimaryUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or /src/assets/..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-mono text-[#1A1A1A] focus:outline-none focus:border-[#D1B464]"
                  />
                  {primaryUrl && (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                      <img
                        src={primaryUrl}
                        alt="Primary Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Image URLs (1 to 4) */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-2">
                  Gallery Images (URLs 1 to 4)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Gallery Image 1</span>
                    <div className="flex gap-2 mt-0.5">
                      <input
                        type="url"
                        value={galleryUrl1}
                        onChange={(e) => setGalleryUrl1(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-mono"
                      />
                      {galleryUrl1 && (
                        <img
                          src={galleryUrl1}
                          alt="G1"
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Gallery Image 2</span>
                    <div className="flex gap-2 mt-0.5">
                      <input
                        type="url"
                        value={galleryUrl2}
                        onChange={(e) => setGalleryUrl2(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-mono"
                      />
                      {galleryUrl2 && (
                        <img
                          src={galleryUrl2}
                          alt="G2"
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Gallery Image 3</span>
                    <div className="flex gap-2 mt-0.5">
                      <input
                        type="url"
                        value={galleryUrl3}
                        onChange={(e) => setGalleryUrl3(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-mono"
                      />
                      {galleryUrl3 && (
                        <img
                          src={galleryUrl3}
                          alt="G3"
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Gallery Image 4</span>
                    <div className="flex gap-2 mt-0.5">
                      <input
                        type="url"
                        value={galleryUrl4}
                        onChange={(e) => setGalleryUrl4(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-mono"
                      />
                      {galleryUrl4 && (
                        <img
                          src={galleryUrl4}
                          alt="G4"
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video URL with Live Player Preview */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  Video URL (YouTube Embed / Vimeo / Direct MP4)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/embed/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-mono text-[#1A1A1A] focus:outline-none focus:border-[#D1B464]"
                />

                {/* Video Embed Player Preview */}
                {videoUrl && (
                  <div className="mt-3 p-3 rounded-2xl bg-[#FAFAFA] border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-[#1B2A4A] block mb-2">
                      Video Live Preview:
                    </span>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      {videoUrl.includes('youtube.com') || videoUrl.includes('vimeo.com') ? (
                        <iframe
                          src={videoUrl}
                          className="w-full h-full border-0"
                          allowFullScreen
                          title="Product Video Preview"
                        />
                      ) : (
                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Inventory & Stock */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] pb-2 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-[#D1B464]" />
                <span>4. Inventory, Units & Minimum Quantities</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Measurement Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ProductUnit)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white cursor-pointer"
                  >
                    <option value="piece">Piece(s)</option>
                    <option value="yard">Yard(s)</option>
                    <option value="set">Set(s)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Minimum Order Quantity (MoQ) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={minOrderQuantity}
                    onChange={(e) => setMinOrderQuantity(Math.max(1, Number(e.target.value)))}
                    placeholder="e.g. 1"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Stock Quantity ({PRODUCT_UNIT_LABELS[unit]}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stockQuantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setStockQuantity(qty);
                      if (qty === 0) setInStock(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] mt-4 sm:mt-0">
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">Stock Status</span>
                    <span className="text-[10px] text-gray-500">
                      {inStock ? 'Available for purchase' : 'Marked as Out of Stock'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInStock(!inStock)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      inStock ? 'bg-[#1B2A4A]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        inStock ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] font-medium text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-2.5 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-semibold text-xs uppercase tracking-wider hover:bg-[#23375e] transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#D1B464]" />
                <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
