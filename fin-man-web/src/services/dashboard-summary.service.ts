import { Injectable } from '@angular/core';
import { UserService } from 'src/services/user-service';
import { map, combineLatest, Observable } from 'rxjs';
import { TransactionsService } from './transactions-service';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { Transaction } from 'src/libs/core/models/transactions';

export interface DashboardSummary {
  totalIncome: string;
  totalExpenses: string;
  netSavings: string;
  savingsRate: string;
  averageMonthlyExpense: string;
  topCategory: string;
}
@Injectable({ providedIn: 'root' })
export class DashboardSummaryService {
  constructor(
    private userService: UserService,
    private transactionsService: TransactionsService
  ) {}

  // Create a summary observable that reacts to a selected year
  getSummary$(selectedYear$: Observable<number>): Observable<DashboardSummary> {
    return combineLatest([
      this.userService.currentUser$,
      this.transactionsService.transactions$,
      selectedYear$,
    ]).pipe(
      map(([user, transactions, year]) => {
        let expenseFiltered = TransactionUtils.getExpenses(transactions);

        expenseFiltered = TransactionUtils.filterByUser(
          expenseFiltered,
          user.name
        );
        let incomeFiltered = TransactionUtils.getIncomes(transactions);

        incomeFiltered = TransactionUtils.filterByUser(
          incomeFiltered,
          user.name
        );
        incomeFiltered = TransactionUtils.filterByYear(incomeFiltered, year);

        const totalIncome = this.getTotal(incomeFiltered, year);
        const totalExpenses = this.getTotal(expenseFiltered, year);
        const netSavings = totalIncome - totalExpenses;
        const savingsRate = netSavings / totalIncome;
        const averageMonthlyExpense = this.getAverageMonthlyExpense(
          expenseFiltered,
          year
        );
        const topCategory = this.getTopCategory(expenseFiltered);
        console.log(
          '%c[Dashboard Summary Updated]',
          'color: #4CAF50; font-weight: bold;',
          {
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate,
            averageMonthlyExpense,
            topCategory,
          }
        );

        return {
          totalIncome: this.formatCurrency(totalIncome),
          totalExpenses: this.formatCurrency(totalExpenses),
          netSavings: this.formatCurrency(netSavings),
          savingsRate: isFinite(savingsRate)
            ? `${(savingsRate * 100).toFixed(1)}%`
            : '0%',
          averageMonthlyExpense: this.formatCurrency(averageMonthlyExpense),
          topCategory,
        };
      })
    );
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  private getTotal(incomes: Transaction[], year: number): number {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    // Start of the year
    startDate = new Date(year, 0, 1); // Jan 1st

    if (year < now.getFullYear()) {
      // Past year → include all months
      endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31st end of day
    } else {
      // Current year → include up to current month
      endDate = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    return TransactionUtils.calculateDateRangeTotal(
      incomes,
      startDate,
      endDate
    );
  }

  private getAverageMonthlyExpense(expenses: any[], year: number): number {
    const byMonth = TransactionUtils.aggregateByMonth(expenses, year);
    if (!byMonth.length) return 0;
    return byMonth.reduce((sum, m) => sum + m.amount, 0) / byMonth.length;
  }

  private getTopCategory(expenses: any[]): string {
    const totals = TransactionUtils.getTotalsByCategory(expenses);
    if (!totals.length) return '-';
    return totals.reduce((a, b) => (a.total > b.total ? a : b)).category;
  }

  private formatCurrency(val: number): string {
    return val.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  }
}
