import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';
import { Chart, ChartConfiguration } from 'chart.js';
import { UserService } from 'src/services/user-service';
import { MonthlyData } from 'src/libs/core/ui-models/monthly-data';
import { TransactionsService } from 'src/services/transactions-service';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.css'],
})
export class TrendChartComponent implements OnInit, OnDestroy {
  @Input() selectedYear$!: Observable<number>;

  @ViewChild('chartCanvas', { static: true })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private destroy$ = new Subject<void>();

  loading = false;

  constructor(
    private transactionService: TransactionsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // React to changes in expenses, user, OR year
    combineLatest([
      this.transactionService.transactions$,
      this.userService.currentUser$,
      this.selectedYear$,
    ])
      .pipe(
        map(([transactions, user, year]) => {
          // EXPENSES
          let filteredExpenses = TransactionUtils.getExpenses(transactions);
          filteredExpenses = TransactionUtils.filterByUser(
            filteredExpenses,
            user.name
          );
          filteredExpenses = TransactionUtils.filterByYear(
            filteredExpenses,
            year
          );

          // INCOMES
          let filteredIncomes = TransactionUtils.getIncomes(transactions);
          filteredIncomes = TransactionUtils.filterByUser(
            filteredIncomes,
            user.name
          );
          filteredIncomes = TransactionUtils.filterByYear(
            filteredIncomes,
            year
          );

          return {
            expensesByMonth: TransactionUtils.aggregateByMonth(
              filteredExpenses,
              year
            ),

            incomesByMonth: TransactionUtils.aggregateByMonth(
              filteredIncomes,
              year
            ),
          };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(({ expensesByMonth, incomesByMonth }) => {
        this.updateChart(expensesByMonth, incomesByMonth);
        this.loading = false;
      });
  }

  private updateChart(
    expensesData: MonthlyData[],
    incomesData: MonthlyData[]
  ): void {
    combineLatest([
      this.userService.currentUser$.pipe(take(1)),
      this.selectedYear$.pipe(take(1)),
    ]).subscribe(([user, selectedYear]) => {
      const chartData = {
        labels: expensesData.map((d) => d.month),
        datasets: [
          {
            label: 'Income',
            data: incomesData.map((i) => i.amount),
            backgroundColor: '#22c55e',
          },
          {
            label: 'Expenses',
            data: expensesData.map((d) => d.amount),
            backgroundColor: '#ef4444',
          },
        ],
      };

      if (this.chart) {
        this.chart.data = chartData;
        this.chart.update('active');
      } else {
        this.createChart(chartData);
      }
    });
  }

  private createChart(data: any): void {
    const config: ChartConfiguration = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  /**
   * Builds an income timeline array for charting.
   * - Normal incomes apply to their actual months only.
   * - Recurring incomes apply to every eligible month.
   * - Future months return 0 unless selectedYear < currentYear.
   */
  private getIncomeTimeline(
    data: MonthlyData[], // normal monthly incomes
    recurringData: MonthlyData[], // incomes marked recurring: true
    selectedYear: number
  ): number[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    return data.map((d) => {
      const monthIndex = this.monthNameToNumber(d.month); // 1-12

      // Base normal income for this month
      const baseIncome = d.amount;

      // Recurring income for this month
      const recurringIncome =
        recurringData.find((r) => r.month === d.month)?.amount ?? 0;

      //
      // RULES
      //

      // Selected year is in the past → all months are valid
      if (selectedYear < currentYear) {
        return baseIncome + recurringIncome;
      }

      // Selected year is in the future → no income yet
      if (selectedYear > currentYear) {
        return 0;
      }

      // Same year → only up to current month
      if (monthIndex <= currentMonth) {
        return baseIncome + recurringIncome;
      }

      // Future month in same year → no income
      return 0;
    });
  }

  /** Convert month names ("Jan", "February", etc.) to numbers */
  private monthNameToNumber(month: string): number {
    return new Date(`${month} 1, 2024`).getMonth() + 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }
}
