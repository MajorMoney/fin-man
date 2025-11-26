import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { CategoryTotal } from 'src/libs/core/ui-models/category-total';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-top-categories',
  templateUrl: './top-categories.component.html',
  styleUrls: ['./top-categories.component.css'],
})
export class TopCategoriesComponent implements OnInit {
  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {}
  @Input() selectedYear$!: Observable<number>;
  categories: { name: string; percent: number }[] = [];
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
        })
      )
      .subscribe((expenses) => {
        this.updateCategories(expenses);
      });
  }

  private updateCategories(expenses: CategoryTotal[]) {
    const total = expenses.reduce((a, b) => a + b.total, 0);
    this.categories = expenses
      .sort((a, b) => b.total - a.total) // sort DESC
      .slice(0, 5) // take top 5
      .map((item) => ({
        name: item.category,
        percent:
          total > 0 ? Number(((item.total / total) * 100).toFixed(2)) : 0,
      }));
  }
}
