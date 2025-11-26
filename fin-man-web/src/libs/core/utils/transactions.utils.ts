import { Transaction } from '../models/transactions';
import { CategoryTotal } from '../ui-models/category-total';
import { TransactionFiltersForm } from '../ui-models/transactions-list-filters';
import { MonthlyData } from '../ui-models/monthly-data';

export class TransactionUtils {
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
    return transactions.filter((t) => {
      const startYear = new Date(t.date).getFullYear();
      if (!t.recurring) return startYear === year;
      const endYear = t.endDate ? new Date(t.endDate).getFullYear() : Infinity;
      return startYear <= year && year <= endYear;
    });
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
    const months = [
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

    const monthlyData: MonthlyData[] = months.map((month) => ({
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
      if (!t.recurring) {
        if (transactionDate.getFullYear() === year) {
          const monthIndex = transactionDate.getMonth();
          monthlyData[monthIndex].amount += t.amount;
        }
        return;
      }

      // -------------------------------------------------------
      // RECURRING TRANSACTION
      // -------------------------------------------------------
      const recurringStart = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        1
      );

      const recurringEnd = t.endDate
        ? new Date(
            new Date(t.endDate).getFullYear(),
            new Date(t.endDate).getMonth(),
            1
          )
        : year === currentYear
        ? yearEnd // ongoing → cap at current month
        : new Date(year, 11, 1); // for other years assume it covers full year

      // Compute actual overlap with the target year
      const from = recurringStart > yearStart ? recurringStart : yearStart;
      const to = recurringEnd < yearEnd ? recurringEnd : yearEnd;

      if (from > to) return; // no overlap in this year

      let current = new Date(from.getFullYear(), from.getMonth(), 1);
      const end = new Date(to.getFullYear(), to.getMonth(), 1);

      while (current <= end) {
        const monthIndex = current.getMonth();
        monthlyData[monthIndex].amount += t.amount;
        current.setMonth(current.getMonth() + 1);
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

      if (!t.recurring) {
        years.add(startYear);
      } else {
        // Recurring → from startYear to endYear or currentYear, capped at currentYear
        let endYear = t.endDate
          ? new Date(t.endDate).getFullYear()
          : currentYear;
        if (endYear > currentYear) endYear = currentYear;

        for (let y = startYear; y <= endYear; y++) {
          years.add(y);
        }
      }
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

      if (!t.recurring) {
        if (transactionDate >= startDate && transactionDate <= endDate) {
          total += t.amount * sign;
        }
      } else {
        const recurringStart = transactionDate;
        const recurringEnd = t.endDate ? new Date(t.endDate) : endDate;

        // Actual recurring period bounded by the requested range
        const from = recurringStart > startDate ? recurringStart : startDate;
        const to = recurringEnd < endDate ? recurringEnd : endDate;

        // Count 1 per month in the overlapping period
        let current = new Date(from.getFullYear(), from.getMonth(), 1);
        const final = new Date(to.getFullYear(), to.getMonth(), 1);

        while (current <= final) {
          total += t.amount * sign;
          current.setMonth(current.getMonth() + 1);
        }
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

      if (!t.recurring) {
        if (transactionDate >= startDate && transactionDate <= endDate) {
          total += t.amount;
        }
      } else {
        const recurringStart = transactionDate;
        const recurringEnd = t.endDate ? new Date(t.endDate) : endDate;

        // Actual recurring period bounded by the requested range
        const from = recurringStart > startDate ? recurringStart : startDate;
        const to = recurringEnd < endDate ? recurringEnd : endDate;

        // Count 1 per month in the overlapping period
        let current = new Date(from.getFullYear(), from.getMonth(), 1);
        const end = new Date(to.getFullYear(), to.getMonth(), 1);
        while (current <= end) {
          total += t.amount;
          current.setMonth(current.getMonth() + 1);
        }
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

  static splitRecurring(transactions: Transaction[]): {
    recurringTransactions: Transaction[];
    normalTransactions: Transaction[];
  } {
    const recurringTransactions = transactions.filter((t) => t.recurring);
    const normalTransactions = transactions.filter((t) => !t.recurring);
    return { recurringTransactions, normalTransactions };
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

    // 5️⃣ Recurring filter
    if (filters.recurring !== 'All') {
      const recurringBool = (filters.recurring as any) === 'true';
      filtered = filtered.filter((t) => !!t.recurring === recurringBool);
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
