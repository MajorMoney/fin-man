export interface RecurringTransactionFiltersForm {
  searchQuery: string;
  type: 'income' | 'expense' | 'All';
  category: string;
  account: string;
  fromDate: string;
  toDate: string;
  minAmount: number | null;
  maxAmount: number | null;
  startDate: string; // ISO date
  recurrenceRule: string; // RRULE string
  endDate?: string; // optional stop date
}

export const DEFAULT_RECURRING_TRANSACTION_FILTERS: RecurringTransactionFiltersForm = {
  searchQuery: '',
  type: 'All',
  category: 'All',
  account: 'All',
  fromDate: '',
  toDate: '',
  minAmount: null,
  maxAmount: null,
  startDate: '', // ISO date
  recurrenceRule: '', // RRULE string
  endDate: '', // optional stop date

};