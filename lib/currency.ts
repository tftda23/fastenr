// Currency utilities and configuration system

export interface CurrencyConfig {
  currency_code: string
  currency_symbol: string
  currency_name: string
  decimal_places: number
  symbol_position: 'before' | 'after'
  thousands_separator: string
  decimal_separator: string
}

// Default currency configuration (GBP)
export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  currency_code: 'GBP',
  currency_symbol: '£',
  currency_name: 'British Pound',
  decimal_places: 2,
  symbol_position: 'before',
  thousands_separator: ',',
  decimal_separator: '.'
}

// Country to currency mapping for signup defaults
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'GB': 'GBP', 'UK': 'GBP',
  'US': 'USD',
  'CA': 'CAD',
  'AU': 'AUD',
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 
  'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'FI': 'EUR',
  'JP': 'JPY',
  'CH': 'CHF',
  'SE': 'SEK',
  'NO': 'NOK',
  'DK': 'DKK'
}

// Get currency code from country code
export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'GBP'
}

// Format currency amount according to configuration
export function formatCurrency(
  amount: number | null | undefined, 
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG
): string {
  if (amount == null) return 'N/A'
  
  // Handle different decimal places
  const fixedAmount = amount.toFixed(config.decimal_places)
  
  // Split into whole and decimal parts
  const [wholePart, decimalPart] = fixedAmount.split('.')
  
  // Add thousands separators
  const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands_separator)
  
  // Combine with decimal part if needed
  const formattedNumber = config.decimal_places > 0 && decimalPart
    ? `${formattedWhole}${config.decimal_separator}${decimalPart}`
    : formattedWhole
  
  // Add currency symbol in correct position
  return config.symbol_position === 'before'
    ? `${config.currency_symbol}${formattedNumber}`
    : `${formattedNumber} ${config.currency_symbol}`
}

// Format currency for display in different contexts
export function formatCurrencyCompact(
  amount: number | null | undefined,
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG
): string {
  if (amount == null) return 'N/A'
  
  // Convert to K, M, B for large numbers
  const absAmount = Math.abs(amount)
  let displayAmount = amount
  let suffix = ''
  
  if (absAmount >= 1000000000) {
    displayAmount = amount / 1000000000
    suffix = 'B'
  } else if (absAmount >= 1000000) {
    displayAmount = amount / 1000000
    suffix = 'M'
  } else if (absAmount >= 1000) {
    displayAmount = amount / 1000
    suffix = 'k'
  }
  
  const formattedAmount = suffix 
    ? displayAmount.toFixed(displayAmount % 1 === 0 ? 0 : 1) + suffix
    : amount.toFixed(config.decimal_places)
  
  return config.symbol_position === 'before'
    ? `${config.currency_symbol}${formattedAmount}`
    : `${formattedAmount} ${config.currency_symbol}`
}

// Parse currency string back to number
export function parseCurrencyString(
  currencyString: string,
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG
): number | null {
  if (!currencyString || currencyString === 'N/A') return null
  
  // Remove currency symbol and spaces
  let cleanString = currencyString.replace(config.currency_symbol, '').trim()
  
  // Replace thousands separators and decimal separators
  cleanString = cleanString
    .replace(new RegExp(`\\${config.thousands_separator}`, 'g'), '')
    .replace(config.decimal_separator, '.')
  
  const parsed = parseFloat(cleanString)
  return isNaN(parsed) ? null : parsed
}

// Get all available currencies (this would typically come from the database)
export const AVAILABLE_CURRENCIES = [
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' }
]

// Validate currency code
export function isValidCurrencyCode(code: string): boolean {
  return AVAILABLE_CURRENCIES.some(currency => currency.code === code)
}

// Get currency symbol from code
export function getCurrencySymbol(currencyCode: string): string {
  const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode)
  return currency?.symbol || '£'
}