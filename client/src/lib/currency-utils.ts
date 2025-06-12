/**
 * Currency utilities for global marketplace
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimalPlaces: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', decimalPlaces: 2 },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimalPlaces: 2 },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimalPlaces: 0 },
};

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode];
  if (!currency) {
    return `${amount} ${currencyCode}`;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });

  return formatter.format(amount);
}

export function getCurrencySymbol(currencyCode: string): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || currencyCode;
}

export function getCurrencyName(currencyCode: string): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.name || currencyCode;
}

export function getAllCurrencies(): CurrencyInfo[] {
  return Object.values(SUPPORTED_CURRENCIES);
}

// Exchange rate conversion (placeholder - in production, use real exchange rates)
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  // Placeholder conversion rates (in production, fetch from currency API)
  const exchangeRates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25, AUD: 1.35, BRL: 5.2 },
    EUR: { USD: 1.18, GBP: 0.86, JPY: 129, CAD: 1.47, AUD: 1.59, BRL: 6.1 },
    GBP: { USD: 1.37, EUR: 1.16, JPY: 150, CAD: 1.71, AUD: 1.85, BRL: 7.1 },
    JPY: { USD: 0.009, EUR: 0.0078, GBP: 0.0067, CAD: 0.011, AUD: 0.012, BRL: 0.047 },
    CAD: { USD: 0.8, EUR: 0.68, GBP: 0.58, JPY: 88, AUD: 1.08, BRL: 4.16 },
    AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, JPY: 81, CAD: 0.93, BRL: 3.85 },
    BRL: { USD: 0.19, EUR: 0.16, GBP: 0.14, JPY: 21, CAD: 0.24, AUD: 0.26 },
  };

  const rate = exchangeRates[fromCurrency]?.[toCurrency];
  if (rate) {
    return amount * rate;
  }

  // If direct conversion not available, convert through USD
  const toUSD = exchangeRates[fromCurrency]?.['USD'] || 1;
  const fromUSD = exchangeRates['USD']?.[toCurrency] || 1;
  return amount * toUSD * fromUSD;
}