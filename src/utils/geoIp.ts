import { CurrencyCode } from '../types/admin';

export interface LocationDetectionResult {
  currency: CurrencyCode;
  countryCode?: string;
  countryName?: string;
  source: 'localStorage' | 'ipwho.is' | 'ipapi.co' | 'browserHeuristics' | 'default';
}

/**
 * IP-based location detector utility.
 * Automatically checks visitor's IP address and sets activeCurrency to NGN if visiting from Nigeria.
 * Respects user's manual currency override if previously selected and saved.
 */
export async function detectUserCurrency(): Promise<LocationDetectionResult> {
  // 1. Check if user manually saved currency preference
  try {
    const savedCurrency = localStorage.getItem('dsp_user_selected_currency') as CurrencyCode | null;
    if (savedCurrency && ['NGN', 'USD', 'GBP', 'EUR'].includes(savedCurrency)) {
      return { currency: savedCurrency, source: 'localStorage' };
    }
  } catch (e) {
    // Ignore storage errors
  }

  // 2. Query HTTPS IP Geolocation API 1: ipwho.is
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const countryCode = data.country_code?.toUpperCase();
        const countryName = data.country;

        if (countryCode === 'NG' || data.currency?.code === 'NGN') {
          return { currency: 'NGN', countryCode: 'NG', countryName, source: 'ipwho.is' };
        } else if (countryCode === 'US') {
          return { currency: 'USD', countryCode, countryName, source: 'ipwho.is' };
        } else if (countryCode === 'GB') {
          return { currency: 'GBP', countryCode, countryName, source: 'ipwho.is' };
        } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'IE', 'AT', 'FI', 'PT', 'GR'].includes(countryCode)) {
          return { currency: 'EUR', countryCode, countryName, source: 'ipwho.is' };
        }
      }
    }
  } catch (err) {
    // Network or timeout failure; move to fallback
  }

  // 3. Fallback IP Geolocation API 2: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const countryCode = data.country_code?.toUpperCase();
      const countryName = data.country_name;

      if (countryCode === 'NG' || data.currency === 'NGN') {
        return { currency: 'NGN', countryCode: 'NG', countryName, source: 'ipapi.co' };
      } else if (countryCode === 'US') {
        return { currency: 'USD', countryCode, countryName, source: 'ipapi.co' };
      } else if (countryCode === 'GB') {
        return { currency: 'GBP', countryCode, countryName, source: 'ipapi.co' };
      } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'IE', 'AT', 'FI', 'PT', 'GR'].includes(countryCode)) {
        return { currency: 'EUR', countryCode, countryName, source: 'ipapi.co' };
      }
    }
  } catch (err) {
    // Network error
  }

  // 4. Browser Heuristics Fallback (Timezone / Language)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || (navigator as any).userLanguage || '').toUpperCase();

    if (
      timezone.includes('Lagos') ||
      timezone.includes('Africa/Lagos') ||
      lang.includes('NG')
    ) {
      return { currency: 'NGN', countryCode: 'NG', countryName: 'Nigeria', source: 'browserHeuristics' };
    }
  } catch (err) {
    // Ignore error
  }

  // Default fallback for DSP Adire store is NGN
  return { currency: 'NGN', countryCode: 'NG', countryName: 'Nigeria', source: 'default' };
}

/**
 * Saves explicit user currency choice so IP auto-detection won't overwrite manual toggle.
 */
export function saveUserCurrencyPreference(currency: CurrencyCode): void {
  try {
    localStorage.setItem('dsp_user_selected_currency', currency);
  } catch (e) {
    // Ignore storage write errors
  }
}
