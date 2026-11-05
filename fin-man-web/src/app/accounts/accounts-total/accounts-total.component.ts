import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Account } from 'src/libs/core/models/accounts';

@Component({
  selector: 'app-accounts-total',
  templateUrl: './accounts-total.component.html',
  styleUrls: ['./accounts-total.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe],
})
export class AccountsTotalComponent {
  @Input() accounts: Account[] = [];
  currency = 'EUR';

  get totalHoldings(): number {
    return this.accounts.reduce(
      (sum, account) => sum + account.holdings,
      0
    );
  }
}
