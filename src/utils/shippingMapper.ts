import { ShippingLocation, MultiCurrencyPrice } from '../types/admin';

export const mapSupabaseShippingLocation = (row: any): ShippingLocation => {
  const ngn = Number(String(row.rate_ngn ?? row.rates?.ngn ?? row.rateNgn ?? 0).replace(/[^0-9.]/g, '')) || 0;

  const usd = typeof row.rate_usd === 'number' ? row.rate_usd : Number(row.rate_usd) || (row.rates?.usd ? Number(row.rates.usd) : Math.round((ngn / 1600) * 100) / 100);
  const gbp = typeof row.rate_gbp === 'number' ? row.rate_gbp : Number(row.rate_gbp) || (row.rates?.gbp ? Number(row.rates.gbp) : Math.round((ngn / 1900) * 100) / 100);
  const eur = typeof row.rate_eur === 'number' ? row.rate_eur : Number(row.rate_eur) || (row.rates?.eur ? Number(row.rates.eur) : Math.round((ngn / 1650) * 100) / 100);

  const stateRegion = row.state_region || row.name || row.stateRegion || 'Standard Delivery';
  const timeframe = row.delivery_timeframe || row.timeframe || '2-4 Business Days';
  const isActive = row.is_active ?? row.isActive ?? true;

  const rates: MultiCurrencyPrice = {
    ngn,
    usd,
    gbp,
    eur,
  };

  return {
    id: row.id,
    state_region: stateRegion,
    rate_ngn: ngn,
    rate_usd: usd,
    rate_gbp: gbp,
    rate_eur: eur,
    delivery_timeframe: timeframe,
    is_active: isActive,
    created_at: row.created_at || row.createdAt || new Date().toISOString(),

    // Backwards-compatibility aliases
    name: stateRegion,
    country: row.country || 'Nigeria / Global',
    timeframe,
    rates,
    isActive,
  };
};

export const calculateCurrencyRatesFromNGN = (rateNGN: number) => {
  const ngn = Math.max(0, Number(rateNGN) || 0);
  return {
    rate_ngn: ngn,
    rate_usd: Math.round((ngn / 1600) * 100) / 100,
    rate_gbp: Math.round((ngn / 1900) * 100) / 100,
    rate_eur: Math.round((ngn / 1650) * 100) / 100,
  };
};
