import React, { useEffect, useState } from 'react';
import { ProductSalesPage } from '../../../pages/ProductSalesPage';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mapSupabaseProductToProduct } from '../../../utils/productMapper';
import { Product } from '../../../types/admin';

export default function ProductSlugPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug || 'royal-olokun-agbada-ensemble';
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (isSupabaseConfigured && supabase) {
        let { data } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (!data) {
          const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
          if (isUuid) {
            const uuidRes = await supabase
              .from('products')
              .select('*')
              .eq('id', slug)
              .maybeSingle();
            data = uuidRes.data;
          }
        }

        if (data) {
          setProduct(mapSupabaseProductToProduct(data));
        }
      }
    }
    loadProduct();
  }, [slug]);

  // Extract special_image_1 through special_image_15
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

  // Filter valid image URLs (non-null, non-empty)
  const validStyleImages = rawSpecialImages.filter(
    (img): img is string => typeof img === 'string' && img.trim().length > 0
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ProductSalesPage
        slug={slug}
        activeCurrency="USD"
        onChangeCurrency={() => {}}
        onNavigateBack={() => {
          window.location.href = '/shop';
        }}
      />

      {/* Style Gallery Section: Hidden automatically if no special image URLs exist */}
      {validStyleImages.length > 0 && (
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
      )}
    </div>
  );
}
