import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Account } from 'src/libs/core/models/accounts';
import { UserHelpers } from 'src/libs/core/models/users';
import { formatEuro } from 'src/libs/core/utils/money';
import { AccountsService } from 'src/services/account-service';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-cash-position',
  templateUrl: './cash-position.component.html',
  styleUrls: ['./cash-position.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class CashPositionComponent {
  private readonly accounts = toSignal(inject(AccountsService).accounts$, {
    initialValue: [] as Account[],
  });
  private readonly user = toSignal(inject(UserService).currentUser$, {
    initialValue: UserHelpers.ALL_USERS,
  });

  readonly view = computed(() => {
    const user = this.user();
    const accounts = UserHelpers.isAllUsers(user)
      ? this.accounts()
      : this.accounts().filter((account) => account.holders.includes(user.name));
    const total = accounts.reduce((sum, account) => sum + account.holdings, 0);
    return {
      accounts,
      total: formatEuro(total),
    };
  });

  euro(amount: number): string {
    return formatEuro(amount);
  }
}
