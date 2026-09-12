import { RecurringTransaction } from '../models/recurring-transaction';
import { Transaction } from '../models/transactions';
import { RecurringTransactionFiltersForm } from '../ui-models/recurring-transactions-list-filters';

export class RecurringTransactionUtils {
  static getAllCategories(transactions: RecurringTransaction[]) {
    return new Set(transactions.map((t) => t.category).filter(Boolean))
  }
  /**
   * Filter transactions by user
   */
  static filterByUser(transactions: RecurringTransaction[], userName: string): RecurringTransaction[] {
    if (userName === 'All') return transactions;
    return transactions.filter(tx => tx.user === userName);
  }

  /**
   * Apply filters from the filters form
   */
  static applyFilters(
    transactions: RecurringTransaction[],
    filters: RecurringTransactionFiltersForm
  ): RecurringTransaction[] {
    return transactions.filter(tx => {
      // Search query: check description, category, notes
      const query = filters.searchQuery?.toLowerCase().trim();
      if (query) {
        const inDescription = tx.description?.toLowerCase().includes(query);
        const inCategory = tx.category?.toLowerCase().includes(query);
        const inNotes = tx.notes?.toLowerCase().includes(query);
        if (!inDescription && !inCategory && !inNotes) return false;
      }

      // Type filter
      if (filters.type && filters.type !== 'All' && tx.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'All' && tx.category !== filters.category) {
        return false;
      }

      // Account filter
      if (filters.account && filters.account !== 'All' && tx.account !== filters.account) {
        return false;
      }



      // Date filters (startDate, fromDate, toDate)
      if (filters.fromDate && new Date(tx.startDate) < new Date(filters.fromDate)) {
        return false;
      }
      if (filters.toDate && new Date(tx.startDate) > new Date(filters.toDate)) {
        return false;
      }

      // Amount filters
      if (filters.minAmount != null && tx.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount != null && tx.amount > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }
}
