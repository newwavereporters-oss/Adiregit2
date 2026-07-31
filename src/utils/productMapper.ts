import { Product } from '../types/admin';

export const mapSupabaseProductToProduct = (row: any): Product => {
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
    unit: (['yard', 'piece', 'set'].includes(row.unit) ? row.unit : 'piece') as any,
    minOrderQuantity: Number(row.min_order_quantity ?? row.minOrderQuantity ?? 1) || 1,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
};
