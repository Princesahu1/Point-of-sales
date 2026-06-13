import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Currencies with exchange rate (vs USD), country tax rate, and locale.
 * Exchange rates are approximate mid-market rates — update periodically.
 * taxRate = standard VAT/GST/Sales Tax % used on the bill print.
 */
export const CURRENCIES = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',           locale: 'en-US',  rate: 1,        taxRate: 8.875, taxLabel: 'Sales Tax' },
  { code: 'EUR', symbol: '€',    name: 'Euro',                locale: 'de-DE',  rate: 0.92,     taxRate: 19,    taxLabel: 'VAT' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',       locale: 'en-GB',  rate: 0.79,     taxRate: 20,    taxLabel: 'VAT' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',        locale: 'en-IN',  rate: 83.5,     taxRate: 18,    taxLabel: 'GST' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen',        locale: 'ja-JP',  rate: 149.5,    taxRate: 10,    taxLabel: 'Consumption Tax' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan',        locale: 'zh-CN',  rate: 7.24,     taxRate: 13,    taxLabel: 'VAT' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',   locale: 'en-AU',  rate: 1.53,     taxRate: 10,    taxLabel: 'GST' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar',     locale: 'en-CA',  rate: 1.36,     taxRate: 13,    taxLabel: 'HST' },
  { code: 'CHF', symbol: 'Fr',   name: 'Swiss Franc',         locale: 'de-CH',  rate: 0.91,     taxRate: 7.7,   taxLabel: 'VAT' },
  { code: 'HKD', symbol: 'HK$',  name: 'Hong Kong Dollar',    locale: 'zh-HK',  rate: 7.82,     taxRate: 0,     taxLabel: 'No Tax' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',    locale: 'en-SG',  rate: 1.34,     taxRate: 9,     taxLabel: 'GST' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona',       locale: 'sv-SE',  rate: 10.42,    taxRate: 25,    taxLabel: 'VAT' },
  { code: 'NOK', symbol: 'kr',   name: 'Norwegian Krone',     locale: 'nb-NO',  rate: 10.55,    taxRate: 25,    taxLabel: 'VAT' },
  { code: 'DKK', symbol: 'kr',   name: 'Danish Krone',        locale: 'da-DK',  rate: 6.88,     taxRate: 25,    taxLabel: 'VAT' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar',  locale: 'en-NZ',  rate: 1.63,     taxRate: 15,    taxLabel: 'GST' },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso',        locale: 'es-MX',  rate: 17.15,    taxRate: 16,    taxLabel: 'IVA' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',      locale: 'pt-BR',  rate: 4.97,     taxRate: 17,    taxLabel: 'ICMS' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand',  locale: 'en-ZA',  rate: 18.63,    taxRate: 15,    taxLabel: 'VAT' },
  { code: 'RUB', symbol: '₽',    name: 'Russian Ruble',       locale: 'ru-RU',  rate: 90.5,     taxRate: 20,    taxLabel: 'VAT' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won',    locale: 'ko-KR',  rate: 1325,     taxRate: 10,    taxLabel: 'VAT' },
  { code: 'TRY', symbol: '₺',    name: 'Turkish Lira',        locale: 'tr-TR',  rate: 32.2,     taxRate: 20,    taxLabel: 'KDV' },
  { code: 'AED', symbol: 'د.إ',  name: 'UAE Dirham',          locale: 'ar-AE',  rate: 3.67,     taxRate: 5,     taxLabel: 'VAT' },
  { code: 'SAR', symbol: '﷼',    name: 'Saudi Riyal',         locale: 'ar-SA',  rate: 3.75,     taxRate: 15,    taxLabel: 'VAT' },
  { code: 'THB', symbol: '฿',    name: 'Thai Baht',           locale: 'th-TH',  rate: 35.1,     taxRate: 7,     taxLabel: 'VAT' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah',   locale: 'id-ID',  rate: 15700,    taxRate: 11,    taxLabel: 'PPN' },
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit',   locale: 'ms-MY',  rate: 4.72,     taxRate: 8,     taxLabel: 'SST' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso',     locale: 'en-PH',  rate: 56.5,     taxRate: 12,    taxLabel: 'VAT' },
  { code: 'PKR', symbol: '₨',    name: 'Pakistani Rupee',     locale: 'ur-PK',  rate: 278,      taxRate: 17,    taxLabel: 'GST' },
  { code: 'BDT', symbol: '৳',    name: 'Bangladeshi Taka',    locale: 'bn-BD',  rate: 110,      taxRate: 15,    taxLabel: 'VAT' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound',      locale: 'ar-EG',  rate: 30.9,     taxRate: 14,    taxLabel: 'VAT' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',      locale: 'en-NG',  rate: 1450,     taxRate: 7.5,   taxLabel: 'VAT' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',     locale: 'en-KE',  rate: 129,      taxRate: 16,    taxLabel: 'VAT' },
  { code: 'GHS', symbol: 'GH₵',  name: 'Ghanaian Cedi',       locale: 'en-GH',  rate: 13.5,     taxRate: 12.5,  taxLabel: 'VAT' },
  { code: 'PLN', symbol: 'zł',   name: 'Polish Zloty',        locale: 'pl-PL',  rate: 3.98,     taxRate: 23,    taxLabel: 'VAT' },
  { code: 'CZK', symbol: 'Kč',   name: 'Czech Koruna',        locale: 'cs-CZ',  rate: 22.8,     taxRate: 21,    taxLabel: 'DPH' },
  { code: 'HUF', symbol: 'Ft',   name: 'Hungarian Forint',    locale: 'hu-HU',  rate: 357,      taxRate: 27,    taxLabel: 'ÁFA' },
  { code: 'ILS', symbol: '₪',    name: 'Israeli Shekel',      locale: 'he-IL',  rate: 3.72,     taxRate: 17,    taxLabel: 'VAT' },
  { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso',        locale: 'es-CL',  rate: 928,      taxRate: 19,    taxLabel: 'IVA' },
  { code: 'COP', symbol: 'COP$', name: 'Colombian Peso',      locale: 'es-CO',  rate: 3960,     taxRate: 19,    taxLabel: 'IVA' },
  { code: 'ARS', symbol: 'ARS$', name: 'Argentine Peso',      locale: 'es-AR',  rate: 880,      taxRate: 21,    taxLabel: 'IVA' },
];

const STORAGE_KEY = 'pos_currency';
// The base currency all product prices are stored in (USD in the backend)
const BASE_CURRENCY_CODE = 'USD';
const BASE_RATE = 1; // USD = 1

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'USD';
  });

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const baseCurrency = CURRENCIES.find((c) => c.code === BASE_CURRENCY_CODE) || CURRENCIES[0];

  const changeCurrency = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setCurrencyCode(code);
  }, []);

  /**
   * Convert a raw amount (stored in USD) to the currently selected currency.
   * rawAmount (USD) * target rate / base rate
   */
  const convertAmount = useCallback(
    (rawAmountUSD) => {
      if (rawAmountUSD == null || isNaN(rawAmountUSD)) return 0;
      return Number(rawAmountUSD) * currency.rate;
    },
    [currency]
  );

  /**
   * Format a numeric value to a locale-aware currency string.
   * Automatically converts from USD base to target currency.
   */
  const formatAmount = useCallback(
    (amountUSD) => {
      const converted = convertAmount(amountUSD);
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: ['JPY', 'KRW', 'IDR', 'HUF', 'CLP'].includes(currency.code) ? 0 : 2,
          maximumFractionDigits: ['JPY', 'KRW', 'IDR', 'HUF', 'CLP'].includes(currency.code) ? 0 : 2,
        }).format(converted);
      } catch {
        return `${currency.symbol}${converted.toFixed(2)}`;
      }
    },
    [currency, convertAmount]
  );

  /** Just the symbol string for compact inline use */
  const symbol = currency.symbol;

  return (
    <CurrencyContext.Provider value={{
      currency, currencyCode, changeCurrency,
      formatAmount, convertAmount, symbol, CURRENCIES,
      baseCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
