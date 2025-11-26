import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Input,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { Transaction } from 'src/libs/core/models/transactions';
import { CategoryTotal } from 'src/libs/core/ui-models/category-total';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-category-chart',
  templateUrl: './category-chart.component.html',
  styleUrls: ['./category-chart.component.css'],
})
export class CategoryChartComponent implements OnInit, OnDestroy {
  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {}
  @Input() selectedYear$!: Observable<number>;

  private chart?: Chart;
  private destroy$ = new Subject<void>();
  loading = false;

  ngOnInit(): void {
    combineLatest([
      this.transactionsService.transactions$,
      this.userService.currentUser$,
      this.selectedYear$,
    ])
      .pipe(
        map(([transactions, user, year]) => {
          let filtered = TransactionUtils.getExpenses(transactions);
          filtered = TransactionUtils.filterByUser(filtered, user.name);
          filtered = TransactionUtils.filterByYear(filtered, year);
          return TransactionUtils.getTotalsByCategory(filtered);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.updateChart(data);
        this.loading = false;
      });
  }

  private updateChart(data: CategoryTotal[]) {
    const chartData = {
      labels: data.map((entry) => entry.category),
      datasets: [
        {
          data: data.map((entry) => entry.total),
          backgroundColor: this.generateColors(data.length),
        },
      ],
    };
    if (this.chart) {
      this.chart.data = chartData;
      this.chart.update('active');
    } else {
      this.createChart(chartData);
    }
  }

  private createChart(data: any): void {
    this.chart = new Chart('categoryChart', {
      type: 'doughnut',
      data: data,
      options: { responsive: true },
    });
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#f97316',
      '#22c55e',
      '#3b82f6',
      '#a855f7',
      '#f59e0b',
      '#ef4444',
      '#14b8a6',
      '#6366f1',
      '#eab308',
      '#ec4899',
    ];

    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }
}
