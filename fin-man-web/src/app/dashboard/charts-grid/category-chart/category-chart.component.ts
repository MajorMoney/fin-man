import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  inject,
  effect
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { CategoryTotal } from 'src/libs/core/ui-models/category-total';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';
import { ThemeService } from 'src/services/theme.service';
import { applyChartJsTheme } from 'src/libs/core/utils/chart-theme';

@Component({
    selector: 'app-category-chart',
    templateUrl: './category-chart.component.html',
    styleUrls: ['./category-chart.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class CategoryChartComponent implements OnInit, OnDestroy {
  private readonly theme = inject(ThemeService);

  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {
    effect(() => {
      this.theme.resolved();
      applyChartJsTheme();
      this.paintChart();
      this.chart?.update('none');
    });
  }
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
          borderColor: this.surfaceColor(),
          hoverBorderColor: this.surfaceColor(),
          borderWidth: 2,
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
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  private paintChart(): void {
    const dataset = this.chart?.data.datasets[0];
    if (!dataset) {
      return;
    }
    const count = Array.isArray(dataset.data) ? dataset.data.length : 0;
    const surface = this.surfaceColor();
    dataset.backgroundColor = this.generateColors(count);
    dataset.borderColor = surface;
    dataset.hoverBorderColor = surface;
  }

  private surfaceColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#1e293b';
  }

  private generateColors(count: number): string[] {
    const palette = this.theme.isDark()
      ? ['#fb923c', '#34d399', '#60a5fa', '#c084fc', '#fbbf24', '#f87171', '#2dd4bf', '#818cf8', '#facc15', '#f472b6']
      : ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#eab308', '#ec4899'];

    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }
}
