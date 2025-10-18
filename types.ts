export type Currency = 'EUR' | 'VND';

export type Period = 'week' | 'month';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  currency: Currency;
  category: string;
}

export interface Settings {
  currency: Currency;
  weeklyLimit: number;
  monthlyLimit: number;
  weeklyLimitNote?: string;
  monthlyLimitNote?: string;
}

export interface ScannedBillData {
  totalAmount: number;
  date: string; // YYYY-MM-DD
  items: { name: string; price: number }[];
  category: string;
}