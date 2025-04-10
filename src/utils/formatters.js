// src/utils/formatUtils.js
import { format, parseISO } from 'date-fns';

/**
 * Formats a date according to the specified date format
 * @param {string|Date} date - The date to format
 * @param {string} dateFormat - The format pattern to use
 * @returns {string} The formatted date string
 */
export const formatDate = (date, dateFormat = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    // Handle both string dates and Date objects
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, dateFormat);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toString();
  }
};

/**
 * Formats a currency value according to the specified currency code
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g., 'AUD', 'USD')
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'AUD') => {
  if (amount === null || amount === undefined) return '';
  
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currencyCode} ${amount}`;
  }
};

/**
 * Formats a number with the specified number of decimal places
 * @param {number} value - The number to format
 * @param {number} decimalPlaces - The number of decimal places
 * @returns {string} The formatted number string
 */
export const formatNumber = (value, decimalPlaces = 2) => {
  if (value === null || value === undefined) return '';
  
  try {
    return new Intl.NumberFormat('en', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toString();
  }
};

/**
 * Formats a percentage value
 * @param {number} value - The decimal value (e.g., 0.15 for 15%)
 * @param {number} decimalPlaces - The number of decimal places
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value, decimalPlaces = 1) => {
  if (value === null || value === undefined) return '';
  
  try {
    return new Intl.NumberFormat('en', {
      style: 'percent',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value * 100}%`;
  }
};