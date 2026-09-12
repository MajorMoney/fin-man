export interface TransactionFiltersForm {
  searchQuery: string;
  type: 'income' | 'expense' | 'All';
  category: string;
  account: string;
  fromDate: string;
  toDate: string;
  minAmount: number | null;
  maxAmount: number | null;
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFiltersForm = {
  searchQuery: '',
  type: 'All',
  category: 'All',
  account: 'All',
  fromDate: '',
  toDate: '',
  minAmount: null,
  maxAmount: null,
};