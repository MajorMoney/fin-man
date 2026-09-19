import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CategoryFilterComponent } from './category-filter/category-filter.component';
import { TopSpendingChartComponent } from './top-spending-chart/top-spending-chart.component';
import { MonthlyAnalysisComponent } from './monthly-analysis/monthly-analysis.component';
import { DetailedTransactionsPlaceholderComponent } from './placeholder/placeholder.component';

@Component({
    selector: 'app-spending-analysis',
    templateUrl: './spending-analysis.component.html',
    styleUrls: ['./spending-analysis.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CategoryFilterComponent, TopSpendingChartComponent, MonthlyAnalysisComponent, DetailedTransactionsPlaceholderComponent]
})
export class SpendingAnalysisComponent {
  selectedCategory: string = 'All';

  categories = [
    'All',
    'Groceries',
    'Transport',
    'Entertainment',
    'Utilities',
    'Dining Out',
    'Shopping',
  ];

  topSpendingData = [
    { category: 'Groceries', amount: 1200, percentage: 35 },
    { category: 'Utilities', amount: 800, percentage: 23 },
    { category: 'Rent', amount: 1400, percentage: 41 },
    { category: 'Transport', amount: 600, percentage: 17 },
    { category: 'Entertainment', amount: 450, percentage: 13 },
    { category: 'Dining Out', amount: 700, percentage: 20 },
    { category: 'Shopping', amount: 500, percentage: 15 },
  ];

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    // Implement filtering logic here
  }
}
