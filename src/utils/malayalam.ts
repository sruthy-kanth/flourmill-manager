// Malayalam Localization Utilities and Formatters

export const MALAYALAM_MONTHS = [
  'ജനുവരി',
  'ഫെബ്രുവരി',
  'മാർച്ച്',
  'ഏപ്രിൽ',
  'മേയ്',
  'ജൂൺ',
  'ജൂലൈ',
  'ഓഗസ്റ്റ്',
  'സെപ്റ്റംബർ',
  'ഒക്ടോബർ',
  'നവംബർ',
  'ഡിസംബർ'
];

export const MALAYALAM_DAYS = [
  'ഞായർ',
  'തിങ്കൾ',
  'ചൊവ്വ',
  'ബുധൻ',
  'വ്യാഴം',
  'വെള്ളി',
  'ശനി'
];

export const COMMON_UNITS = [
  { id: 'കിലോ', label: 'കിലോ (kg)' },
  { id: 'ഗ്രാം', label: 'ഗ്രാം (g)' },
  { id: 'ലിറ്റർ', label: 'ലിറ്റർ (L)' },
  { id: 'എണ്ണം', label: 'എണ്ണം (Nos)' },
  { id: 'ചാക്ക്', label: 'ചാക്ക് (Bag)' },
  { id: 'ടിൻ', label: 'ടിൻ (Tin)' },
];

/**
 * Format currency in Indian Rupees format (₹ 1,250.00 or ₹ 1,250)
 */
export function formatCurrency(amount: number | undefined | null, showDecimals: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : (amount % 1 === 0 ? 0 : 2),
    maximumFractionDigits: 2,
  };

  try {
    return new Intl.NumberFormat('en-IN', options).format(amount);
  } catch {
    return `₹${amount.toFixed(showDecimals ? 2 : 0)}`;
  }
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity: number, unit: string = 'കിലോ'): string {
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(quantity);
  return `${formattedNumber} ${unit}`;
}

/**
 * Format Date to Malayalam readable format (e.g., "11 സെപ്റ്റംബർ 2026")
 */
export function formatMalayalamDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;

  const today = new Date();
  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return 'ഇന്ന് (' + date.getDate().toString().padStart(2, '0') + ' ' + MALAYALAM_MONTHS[date.getMonth()] + ')';
  } else if (dateStr === yesterdayStr) {
    return 'ഇന്നലെ (' + date.getDate().toString().padStart(2, '0') + ' ' + MALAYALAM_MONTHS[date.getMonth()] + ')';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = MALAYALAM_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Short Malayalam date (e.g., "11 സെപ്റ്റംബർ")
 */
export function formatShortMalayalamDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate().toString().padStart(2, '0');
  const month = MALAYALAM_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Phone number for clean display
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return 'നൽകിയിട്ടില്ല';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
}
