import { CurrencyCode } from '../types/admin';

// Base Exchange Rates relative to NGN (Naira ₦)
// Base Currency: NGN (Naira ₦)
// USD Rate: 1 USD = 1,600 NGN
// GBP Rate: 1 GBP = 1,900 NGN
// EUR Rate: 1 EUR = 1,650 NGN
export const NGN_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1600, // 1 USD = 1600 NGN
  GBP: 1900, // 1 GBP = 1900 NGN
  EUR: 1650, // 1 EUR = 1650 NGN
};

export interface BankAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: CurrencyCode;
}

// Global Bank Account Details Config
export const BANK_DETAILS: Record<CurrencyCode, BankAccountDetails> = {
  NGN: {
    bankName: 'GTBank PLC',
    accountNumber: '3003427369',
    accountName: 'DSP Academy LTD',
    currency: 'NGN',
  },
  USD: {
    bankName: 'GTBank PLC',
    accountNumber: '3003427194',
    accountName: 'DSP Academy LTD',
    currency: 'USD',
  },
  EUR: {
    bankName: 'GTBank PLC',
    accountNumber: '3003427211',
    accountName: 'DSP Academy LTD',
    currency: 'EUR',
  },
  GBP: {
    bankName: 'GTBank PLC',
    accountNumber: '3003427235',
    accountName: 'DSP Academy LTD',
    currency: 'GBP',
  },
};

/**
 * Converts an amount from base NGN into the target currency.
 */
export function convertFromNGN(amountInNGN: number, targetCurrency: CurrencyCode): number {
  if (targetCurrency === 'NGN') return amountInNGN;
  const rate = NGN_EXCHANGE_RATES[targetCurrency];
  if (!rate || rate === 0) return amountInNGN;
  return amountInNGN / rate;
}

/**
 * Converts an amount in any currency back to base NGN.
 */
export function convertToNGN(amount: number, fromCurrency: CurrencyCode): number {
  if (fromCurrency === 'NGN') return amount;
  const rate = NGN_EXCHANGE_RATES[fromCurrency];
  return amount * rate;
}

/**
 * Formats currency values nicely according to the currency code.
 */
export function formatCurrencyValue(amount: number, currency: CurrencyCode): string {
  const symbolMap: Record<CurrencyCode, string> = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    EUR: '€',
  };

  const symbol = symbolMap[currency] || '₦';

  if (currency === 'NGN') {
    return `${symbol}${Math.round(amount).toLocaleString('en-NG')}`;
  }

  // Round to 2 decimal places for USD, GBP, EUR
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculates Commitment Deposit for Pay on Delivery in specified currency.
 * Fixed base deposit: ₦2,000 NGN
 * USD: ~$1.25 | GBP: ~£1.05 | EUR: ~€1.21
 */
export function getCommitmentDeposit(currency: CurrencyCode): { amount: number; formatted: string } {
  const depositInNGN = 2000;
  if (currency === 'NGN') {
    return { amount: 2000, formatted: '₦2,000' };
  }
  if (currency === 'USD') {
    return { amount: 1.25, formatted: '$1.25' };
  }
  if (currency === 'GBP') {
    return { amount: 1.05, formatted: '£1.05' };
  }
  if (currency === 'EUR') {
    return { amount: 1.21, formatted: '€1.21' };
  }
  const converted = convertFromNGN(depositInNGN, currency);
  return { amount: converted, formatted: formatCurrencyValue(converted, currency) };
}
