
import type { Currency } from './types';

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
