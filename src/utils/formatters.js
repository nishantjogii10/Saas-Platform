/**
 * StockMate SaaS — Business Formatting Utilities
 * Standardized date, currency (INR ₹), quantity, and percentage formatting
 */

/**
 * Formats a numeric value or string into Indian Rupee (INR ₹) currency representation.
 * Example: 12500 -> "₹12,500.00" or "₹12,500" if rounded
 */
export const formatCurrency = (val, { showDecimals = true, fallback = '₹0' } = {}) => {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return fallback;
  }
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
};

/**
 * Formats ISO date or date string into readable business format: e.g. "27 Oct 2026"
 */
export const formatDate = (dateInput, { fallback = '—' } = {}) => {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats ISO date or timestamp into readable date & time: e.g. "27 Oct 2026, 02:30 PM"
 */
export const formatDateTime = (dateInput, { fallback = '—' } = {}) => {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
