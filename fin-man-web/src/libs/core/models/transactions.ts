export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TransactionType; // "income" or "expense"
  date: string; // ISO date string
  description: string;
  amount: number;
  currency?: string;
  account?: string;
  category: string;
  notes?: string;
  user: string;

  // Recurring fields
  recurring?: boolean;
  recurrenceRule?: string; // e.g., "monthly", "weekly", cron-like string
  endDate?: string; // optional end date for recurrence
}
