/**
 * Country and region utilities for global marketplace
 */

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  language: string;
  phoneCode: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  US: { code: 'US', name: 'United States', currency: 'USD', timezone: 'America/New_York', language: 'en', phoneCode: '+1' },
  GB: { code: 'GB', name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London', language: 'en', phoneCode: '+44' },
  FR: { code: 'FR', name: 'France', currency: 'EUR', timezone: 'Europe/Paris', language: 'fr', phoneCode: '+33' },
  DE: { code: 'DE', name: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin', language: 'de', phoneCode: '+49' },
  IT: { code: 'IT', name: 'Italy', currency: 'EUR', timezone: 'Europe/Rome', language: 'it', phoneCode: '+39' },
  ES: { code: 'ES', name: 'Spain', currency: 'EUR', timezone: 'Europe/Madrid', language: 'es', phoneCode: '+34' },
  CA: { code: 'CA', name: 'Canada', currency: 'CAD', timezone: 'America/Toronto', language: 'en', phoneCode: '+1' },
  AU: { code: 'AU', name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney', language: 'en', phoneCode: '+61' },
  JP: { code: 'JP', name: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo', language: 'ja', phoneCode: '+81' },
  CN: { code: 'CN', name: 'China', currency: 'CNY', timezone: 'Asia/Shanghai', language: 'zh', phoneCode: '+86' },
  IN: { code: 'IN', name: 'India', currency: 'INR', timezone: 'Asia/Kolkata', language: 'en', phoneCode: '+91' },
  BR: { code: 'BR', name: 'Brazil', currency: 'BRL', timezone: 'America/Sao_Paulo', language: 'pt', phoneCode: '+55' },
  MX: { code: 'MX', name: 'Mexico', currency: 'MXN', timezone: 'America/Mexico_City', language: 'es', phoneCode: '+52' },
  KR: { code: 'KR', name: 'South Korea', currency: 'KRW', timezone: 'Asia/Seoul', language: 'ko', phoneCode: '+82' },
  SG: { code: 'SG', name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore', language: 'en', phoneCode: '+65' },
  HK: { code: 'HK', name: 'Hong Kong', currency: 'HKD', timezone: 'Asia/Hong_Kong', language: 'en', phoneCode: '+852' },
  NO: { code: 'NO', name: 'Norway', currency: 'NOK', timezone: 'Europe/Oslo', language: 'no', phoneCode: '+47' },
  SE: { code: 'SE', name: 'Sweden', currency: 'SEK', timezone: 'Europe/Stockholm', language: 'sv', phoneCode: '+46' },
  DK: { code: 'DK', name: 'Denmark', currency: 'DKK', timezone: 'Europe/Copenhagen', language: 'da', phoneCode: '+45' },
  NL: { code: 'NL', name: 'Netherlands', currency: 'EUR', timezone: 'Europe/Amsterdam', language: 'nl', phoneCode: '+31' },
  BE: { code: 'BE', name: 'Belgium', currency: 'EUR', timezone: 'Europe/Brussels', language: 'nl', phoneCode: '+32' },
  CH: { code: 'CH', name: 'Switzerland', currency: 'CHF', timezone: 'Europe/Zurich', language: 'de', phoneCode: '+41' },
  AT: { code: 'AT', name: 'Austria', currency: 'EUR', timezone: 'Europe/Vienna', language: 'de', phoneCode: '+43' },
  PL: { code: 'PL', name: 'Poland', currency: 'PLN', timezone: 'Europe/Warsaw', language: 'pl', phoneCode: '+48' },
  CZ: { code: 'CZ', name: 'Czech Republic', currency: 'CZK', timezone: 'Europe/Prague', language: 'cs', phoneCode: '+420' },
  HU: { code: 'HU', name: 'Hungary', currency: 'HUF', timezone: 'Europe/Budapest', language: 'hu', phoneCode: '+36' },
  PT: { code: 'PT', name: 'Portugal', currency: 'EUR', timezone: 'Europe/Lisbon', language: 'pt', phoneCode: '+351' },
  GR: { code: 'GR', name: 'Greece', currency: 'EUR', timezone: 'Europe/Athens', language: 'el', phoneCode: '+30' },
  FI: { code: 'FI', name: 'Finland', currency: 'EUR', timezone: 'Europe/Helsinki', language: 'fi', phoneCode: '+358' },
  IE: { code: 'IE', name: 'Ireland', currency: 'EUR', timezone: 'Europe/Dublin', language: 'en', phoneCode: '+353' },
  NZ: { code: 'NZ', name: 'New Zealand', currency: 'NZD', timezone: 'Pacific/Auckland', language: 'en', phoneCode: '+64' },
  ZA: { code: 'ZA', name: 'South Africa', currency: 'ZAR', timezone: 'Africa/Johannesburg', language: 'en', phoneCode: '+27' },
  RU: { code: 'RU', name: 'Russia', currency: 'RUB', timezone: 'Europe/Moscow', language: 'ru', phoneCode: '+7' },
  TR: { code: 'TR', name: 'Turkey', currency: 'TRY', timezone: 'Europe/Istanbul', language: 'tr', phoneCode: '+90' },
  AE: { code: 'AE', name: 'United Arab Emirates', currency: 'AED', timezone: 'Asia/Dubai', language: 'ar', phoneCode: '+971' },
  SA: { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', timezone: 'Asia/Riyadh', language: 'ar', phoneCode: '+966' },
  IL: { code: 'IL', name: 'Israel', currency: 'ILS', timezone: 'Asia/Jerusalem', language: 'he', phoneCode: '+972' },
  TH: { code: 'TH', name: 'Thailand', currency: 'THB', timezone: 'Asia/Bangkok', language: 'th', phoneCode: '+66' },
  MY: { code: 'MY', name: 'Malaysia', currency: 'MYR', timezone: 'Asia/Kuala_Lumpur', language: 'ms', phoneCode: '+60' },
  PH: { code: 'PH', name: 'Philippines', currency: 'PHP', timezone: 'Asia/Manila', language: 'en', phoneCode: '+63' },
  VN: { code: 'VN', name: 'Vietnam', currency: 'VND', timezone: 'Asia/Ho_Chi_Minh', language: 'vi', phoneCode: '+84' },
  ID: { code: 'ID', name: 'Indonesia', currency: 'IDR', timezone: 'Asia/Jakarta', language: 'id', phoneCode: '+62' },
  EG: { code: 'EG', name: 'Egypt', currency: 'EGP', timezone: 'Africa/Cairo', language: 'ar', phoneCode: '+20' },
  AR: { code: 'AR', name: 'Argentina', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires', language: 'es', phoneCode: '+54' },
  CL: { code: 'CL', name: 'Chile', currency: 'CLP', timezone: 'America/Santiago', language: 'es', phoneCode: '+56' },
  CO: { code: 'CO', name: 'Colombia', currency: 'COP', timezone: 'America/Bogota', language: 'es', phoneCode: '+57' },
  PE: { code: 'PE', name: 'Peru', currency: 'PEN', timezone: 'America/Lima', language: 'es', phoneCode: '+51' },
};

export function getCountryInfo(countryCode: string): CountryInfo | undefined {
  return COUNTRIES[countryCode];
}

export function getAllCountries(): CountryInfo[] {
  return Object.values(COUNTRIES).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCountriesByRegion() {
  const regions = {
    'North America': ['US', 'CA', 'MX'],
    'Europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'NO', 'SE', 'DK', 'PL', 'CZ', 'HU', 'PT', 'GR', 'FI', 'IE', 'RU', 'TR'],
    'Asia Pacific': ['JP', 'CN', 'KR', 'SG', 'HK', 'AU', 'NZ', 'IN', 'TH', 'MY', 'PH', 'VN', 'ID'],
    'Latin America': ['BR', 'AR', 'CL', 'CO', 'PE'],
    'Middle East & Africa': ['AE', 'SA', 'IL', 'EG', 'ZA'],
  };

  return Object.entries(regions).map(([region, codes]) => ({
    region,
    countries: codes.map(code => COUNTRIES[code]).filter(Boolean)
  }));
}

export function detectUserCountry(): string {
  // Try to detect user's country from timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  for (const [code, country] of Object.entries(COUNTRIES)) {
    if (country.timezone === timezone) {
      return code;
    }
  }
  
  // Fallback to language detection
  const language = navigator.language.split('-')[0];
  for (const [code, country] of Object.entries(COUNTRIES)) {
    if (country.language === language) {
      return code;
    }
  }
  
  return 'US'; // Default fallback
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  const country = getCountryInfo(countryCode);
  if (!country || !phone) return phone;
  
  // Remove any existing country code
  const cleanPhone = phone.replace(/^\+?\d{1,4}[-\s]?/, '');
  return `${country.phoneCode} ${cleanPhone}`;
}