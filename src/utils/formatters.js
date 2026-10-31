/**
 * StockMate SaaS — Business Formatting Utilities
 * Standardized date, currency, quantity, and percentage formatting with locale & timezone support
 */

/**
 * Formats a numeric value or string into configured currency representation (defaults to INR ₹).
 * Example: 12500 -> "₹12,500.00"
 */
export const formatCurrency = (
  val,
  { currency = 'INR', locale = 'en-IN', showDecimals = true, fallback = '₹0' } = {}
) => {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return fallback;
  }
  const num = Number(val);
  try {
    return new Intl.NumberFormat(locale || 'en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(num);
  } catch (err) {
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    })}`;
  }
};

/**
 * Formats ISO date or date string into configured date format & time zone
 */
export const formatDate = (
  dateInput,
  { format = 'DD/MM/YYYY', timeZone = 'Asia/Kolkata', fallback = '—' } = {}
) => {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const tzOption = timeZone ? { timeZone } : {};

    if (format === 'YYYY-MM-DD') {
      return new Intl.DateTimeFormat('en-CA', { ...tzOption, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    }
    if (format === 'MM/DD/YYYY') {
      return new Intl.DateTimeFormat('en-US', { ...tzOption, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    }
    if (format === 'DD MMM YYYY') {
      return new Intl.DateTimeFormat('en-GB', { ...tzOption, year: 'numeric', month: 'short', day: '2-digit' }).format(d);
    }
    // Default 'DD/MM/YYYY'
    return new Intl.DateTimeFormat('en-GB', { ...tzOption, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats ISO date or timestamp into readable date & time with time zone
 */
export const formatDateTime = (
  dateInput,
  { timeZone = 'Asia/Kolkata', hour12 = true, fallback = '—' } = {}
) => {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const tzOption = timeZone ? { timeZone } : {};
    return new Intl.DateTimeFormat('en-IN', {
      ...tzOption,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: hour12,
    }).format(d);
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats quantities with unit: e.g. "25 kg", "10 pkts", "5.5 L"
 */
export const formatQuantity = (qty, unit = '') => {
  if (qty === null || qty === undefined || isNaN(Number(qty))) return '0';
  const num = Number(qty);
  const formattedNum = Number.isInteger(num) ? num.toString() : num.toFixed(2);
  return unit ? `${formattedNum} ${unit}` : formattedNum;
};

/**
 * Formats a fraction or percentage value: e.g. 0.18 -> "18.0%" or 18 -> "18.0%"
 */
export const formatPercentage = (val, { isDecimal = false, decimals = 1 } = {}) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '0%';
  const num = isDecimal ? Number(val) * 100 : Number(val);
  return `${num.toFixed(decimals)}%`;
};

/**
 * Cleans and formats phone numbers for display: "+91 98220 12345"
 */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  return String(phone).trim();
};
