/**
 * Format a number as Indian Rupee currency
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date string to a readable format
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate discounted price
 * @param {number} price
 * @param {number} discountPercent
 * @returns {number}
 */
export const calcDiscountedPrice = (price, discountPercent) => {
  if (!discountPercent) return price;
  return Math.round(price * (1 - discountPercent / 100));
};

/**
 * Truncate text to a given length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 80) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
