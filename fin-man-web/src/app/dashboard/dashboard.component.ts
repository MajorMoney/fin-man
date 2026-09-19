import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, combineLatest, map, take } from 'rxjs';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';
import { FormsModule } from '@angular/forms';
import { SummaryGridComponent } from './summary-grid/summary-grid.component';
import { TrendChartComponent } from './charts-grid/trend-chart/trend-chart.component';
import { CategoryChartComponent } from './charts-grid/category-chart/category-chart.component';
import { TopCategoriesComponent } from './charts-grid/top-categories/top-categories.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, SummaryGridComponent, TrendChartComponent, CategoryChartComponent, TopCategoriesComponent, AsyncPipe]
})
export class DashboardComponent implements OnInit {
  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {}

  // Make selectedYear reactive
  private selectedYearSubject = new BehaviorSubject<number>(
    new Date().getFullYear()
  );
  selectedYear$ = this.selectedYearSubject.asObservable();

  availableYears: number[] = [];
  ngOnInit(): void {
    combineLatest([
      this.transactionsService.transactions$,
      this.userService.currentUser$,
    ])
      .pipe(
        map(([transactions, user]) => {
          const filtered = TransactionUtils.filterByUser(transactions, user.name);
          return TransactionUtils.getAvailableYears(filtered);
        })
      )
      .subscribe((availableYears) => (this.availableYears = availableYears));
  }

  // Getter for template binding
  get selectedYear(): number {
    return this.selectedYearSubject.value;
  }
  onYearChange(year: number): void {
    this.selectedYearSubject.next(year); // Emit new value - triggers combineLatest
  }
}
