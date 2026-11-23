import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  budgetBarColor,
  budgetMonthParts,
  budgetPercent,
  deriveCategoryBudgets,
  incomeInPeriod,
  summarizeBudgets,
} from 'src/libs/core/models/budget';
import { Transaction } from 'src/libs/core/models/transactions';
import { UserHelpers } from 'src/libs/core/models/users';
import { formatEuro } from 'src/libs/core/utils/money';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { BudgetingService } from 'src/services/budgeting.service';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

@Component({
  selector: 'app-month-budget',
  templateUrl: './month-budget.component.html',
  styleUrls: ['./month-budget.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class MonthBudgetComponent {
  private readonly budgeting = inject(BudgetingService);
  private readonly transactions = toSignal(
    inject(TransactionsService).transactions$,
    { initialValue: [] as Transaction[] }
  );
  private readonly user = toSignal(inject(UserService).currentUser$, {
    initialValue: UserHelpers.ALL_USERS,
  });

  readonly view = computed(() => {
    const month = currentMonthKey();
    const parts = budgetMonthParts(month);
    const spending = TransactionUtils.filterByUser(
      this.transactions(),
      this.user().name
    ).map((transaction) => ({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
    }));
    const categories = parts
      ? deriveCategoryBudgets(
          this.budgeting.budgets(),
          spending,
          'monthly',
          month
        )
      : [];
    const summary = summarizeBudgets(categories);
    const income = parts
      ? incomeInPeriod(spending, parts.year, parts.month)
      : 0;
    const flags = categories
      .filter((category) => budgetPercent(category.spent, category.limit) >= 90)
      .sort(
        (left, right) =>
          budgetPercent(right.spent, right.limit) -
          budgetPercent(left.spent, left.limit)
      )
      .map((category) => {
        const percent = budgetPercent(category.spent, category.limit);
        const over = category.spent > category.limit;
        const text = over
          ? `${category.name} is ${formatEuro(category.spent - category.limit)} over its ${formatEuro(category.limit)} limit`
          : `${category.name} is at ${percent}% of its ${formatEuro(category.limit)} limit`;
        return { name: category.name, text, over };
      });

    return {
      label: new Date().toLocaleString('en-GB', { month: 'long' }),
      percent: summary.percentUsed,
      shown: Math.min(Math.max(summary.percentUsed, 0), 100),
      color: budgetBarColor(summary.percentUsed),
      income: formatEuro(income),
      spent: formatEuro(summary.totalSpent),
      budget: formatEuro(summary.totalBudget),
      left: formatEuro(summary.remaining),
      leftNegative: summary.remaining < 0,
      flags,
    };
  });
}
