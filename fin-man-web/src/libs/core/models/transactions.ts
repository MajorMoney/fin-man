export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TransactionType;
  date: string; // ISO date string
  description: string;
  amount: number;
  currency?: string;
  account: string;
  category: string;
  notes?: string;
  user: string;
}
