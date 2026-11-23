import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
import { UserHelpers } from 'src/libs/core/models/users';
import { formatEuro } from 'src/libs/core/utils/money';
import { addDays, formatMonthLabel, todayIso } from 'src/libs/core/utils/savings.utils';
import { RecurringTransactionsService } from 'src/services/recurring-transaction-service';
import { UserService } from 'src/services/user-service';

interface DueItem {
  id: number;
  when: string;
  description: string;
  account: string;
  amount: string;
}

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class UpcomingComponent {
  private readonly recurring = toSignal(
    inject(RecurringTransactionsService).recurringTransactions$,
    { initialValue: [] as RecurringTransaction[] }
  );
  private readonly user = toSignal(inject(UserService).currentUser$, {
    initialValue: UserHelpers.ALL_USERS,
  });

  readonly view = computed(() => {
    const today = todayIso();
    const until = addDays(today, 30);
    const user = this.user();
    const due = this.recurring()
      .filter((item) => this.isDue(item, today, until, user.name))
      .sort((left, right) => {
        const byDate = (left.nextDueDate ?? '').localeCompare(
          right.nextDueDate ?? ''
        );
        return byDate || left.description.localeCompare(right.description);
      });
    const outgoing = due.filter((item) => item.type === 'expense');
    const incoming = due.filter((item) => item.type === 'income');
    return {
      outTotal: formatEuro(this.sum(outgoing)),
      inTotal: formatEuro(this.sum(incoming)),
      outgoing: outgoing.map((item) => this.toRow(item)),
      incoming: incoming.map((item) => this.toRow(item)),
    };
  });

  private isDue(
    item: RecurringTransaction,
    today: string,
    until: string,
    userName: string
  ): boolean {
    const due = item.nextDueDate?.slice(0, 10);
    if (!due || due < today || due > until) return false;
    if (userName !== 'All' && item.user !== userName) return false;
    return true;
  }

  private sum(items: RecurringTransaction[]): number {
    return items.reduce((total, item) => total + item.amount, 0);
  }

  private toRow(item: RecurringTransaction): DueItem {
    const due = item.nextDueDate?.slice(0, 10) ?? '';
    return {
      id: item.id,
      when: formatMonthLabel(due, true),
      description: item.description,
      account: item.account,
      amount: formatEuro(item.amount),
    };
  }
}
