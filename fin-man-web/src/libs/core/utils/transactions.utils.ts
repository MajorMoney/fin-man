import { Transaction } from '../models/transactions';
import { CategoryTotal } from '../ui-models/category-total';
import { TransactionFiltersForm } from '../ui-models/transactions-list-filters';
import { MonthlyData } from '../ui-models/monthly-data';

export class TransactionUtils {
  static readonly MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  static filterByUser(
    transactions: Transaction[],
    userName: string
  ): Transaction[] {
    if (userName === 'All') return transactions;
    return transactions.filter((t) => t.user === userName);
  }

  static getExpenses(transactions: Transaction[]) {
    return this.filterByType(transactions, 'expense');
  }
  static getIncomes(transactions: Transaction[]) {
    return this.filterByType(transactions, 'income');
  }
  private static filterByType(
    transactions: Transaction[],
    type: 'income' | 'expense'
  ): Transaction[] {
    return transactions.filter((t) => t.type === type);
  }

  static filterByYear(
    transactions: Transaction[],
    year: number
  ): Transaction[] {
    return transactions.filter((t) => new Date(t.date).getFullYear() === year);
  }

  static filterByDateRange(
    transactions: Transaction[],
    start: Date,
    end: Date
  ): Transaction[] {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }

  static filterByCategory(
    transactions: Transaction[],
    category: string
  ): Transaction[] {
    return transactions.filter((t) => t.category === category);
  }

  static aggregateByMonth(
    transactions: Transaction[],
    year: number
  ): MonthlyData[] {
    const monthlyData: MonthlyData[] = this.MONTHS.map((month) => ({
      month,
      amount: 0,
    }));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth(); // 0–11

    // Bound the target year's valid months
    const yearStart = new Date(year, 0, 1);
    const yearEnd =
      year === currentYear
        ? new Date(year, currentMonthIndex, 1) // stop at current month for current year
        : new Date(year, 11, 1); // full year for past/future years

    transactions.forEach((t) => {
      const transactionDate = new Date(t.date);

      // -------------------------------------------------------
      // NON-RECURRING TRANSACTION
      // -------------------------------------------------------
      if (transactionDate.getFullYear() === year) {
        const monthIndex = transactionDate.getMonth();
        monthlyData[monthIndex].amount += t.amount;
        return;
      }
    });

    return monthlyData;
  }

  static getTotalsByCategory(transactions: Transaction[]): CategoryTotal[] {
    const totals = new Map<string, number>();
    transactions.forEach((t) => {
      const current = totals.get(t.category) || 0;
      totals.set(t.category, current + t.amount);
    });
    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }

  static getAvailableYears(transactions: Transaction[]): number[] {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();

    transactions.forEach((t) => {
      let startYear = new Date(t.date).getFullYear();
      if (startYear > currentYear) return; // ignore future-start transactions
      years.add(startYear);
    });

    return Array.from(years).sort((a, b) => b - a); // descending
  }
  static getAllCategories(transactions: Transaction[]): Set<string> {
    return new Set(transactions.map((t) => t.category).filter(Boolean));
  }

  static calculateDateRangeTotalBalance(
    transactions: Transaction[],
    startDate: Date,
    endDate: Date
  ): number {
    let total = 0;

    transactions.forEach((t) => {
      const transactionDate = new Date(t.date);

      // Skip transactions completely outside the range
      if (transactionDate > endDate) return;

      const sign = t.type === 'income' ? 1 : -1;

      if (transactionDate >= startDate && transactionDate <= endDate) {
        total += t.amount * sign;
      }
    });

    return total;
  }

  static calculateDateRangeTotal(
    transactions: Transaction[],
    startDate: Date,
    endDate: Date
  ): number {
    const now = new Date();

    let total = 0;
    transactions.forEach((t) => {
      const transactionDate = new Date(t.date);

      // Skip transactions completely outside the range
      if (transactionDate > endDate) return;

      if (transactionDate >= startDate && transactionDate <= endDate) {
        total += t.amount;
      }
    });

    return total;
  }

  static getDateRange(
    transactions: Transaction[]
  ): { start: Date; end: Date } | null {
    if (transactions.length === 0) return null;
    const dates = transactions.map((t) => new Date(t.date));
    return {
      start: new Date(Math.min(...dates.map((d) => d.getTime()))),
      end: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }

  /**
   * Filters an array of transactions based on the provided filters
   */
  static applyFilters(
    transactions: Transaction[],
    filters: TransactionFiltersForm
  ): Transaction[] {
    let filtered = transactions;

    // 1️⃣ Search query filter (description, category, notes, account, user)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query) ||
          t.account?.toLowerCase().includes(query) ||
          t.user?.toLowerCase().includes(query)
      );
    }

    // 2️⃣ Type filter (income / expense)
    if (filters.type && filters.type !== 'All') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // 3️⃣ Category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // 4️⃣ Account filter
    if (filters.account && filters.account !== 'All') {
      filtered = filtered.filter((t) => t.account === filters.account);
    }

    // 6️⃣ Date range filter
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => new Date(t.date) >= fromDate);
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= toDate);
    }

    // 7️⃣ Amount range filter
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount <= filters.maxAmount!);
    }

    return filtered;
  }
}
