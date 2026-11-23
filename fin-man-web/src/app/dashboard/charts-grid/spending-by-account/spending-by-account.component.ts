import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, Observable } from 'rxjs';
import { formatEuro } from 'src/libs/core/utils/money';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

interface AccountSpend {
  name: string;
  amount: string;
  percent: number;
}

@Component({
  selector: 'app-spending-by-account',
  templateUrl: './spending-by-account.component.html',
  styleUrls: ['./spending-by-account.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class SpendingByAccountComponent implements OnInit {
  @Input() selectedYear$!: Observable<number>;

  accounts: AccountSpend[] = [];

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.transactionsService.transactions$,
      this.userService.currentUser$,
      this.selectedYear$,
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([transactions, user, year]) => {
        let filtered = TransactionUtils.getExpenses(transactions);
        filtered = TransactionUtils.filterByUser(filtered, user.name);
        filtered = TransactionUtils.filterByYear(filtered, year);
        const totals = new Map<string, number>();
        for (const transaction of filtered) {
          const name = transaction.account.trim() || 'No account';
          totals.set(name, (totals.get(name) ?? 0) + transaction.amount);
        }
        const rows = [...totals.entries()].sort((left, right) => right[1] - left[1]);
        const total = rows.reduce((sum, [, amount]) => sum + amount, 0);
        this.accounts = rows.map(([name, amount]) => ({
          name,
          amount: formatEuro(amount),
          percent: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
        }));
      });
  }
}
