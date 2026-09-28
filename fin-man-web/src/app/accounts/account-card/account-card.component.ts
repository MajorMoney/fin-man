import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Account } from 'src/libs/core/models/accounts';
import { ACCOUNT_CARD_BACKGROUNDS } from 'src/libs/core/ui-models/account-card-backgrounds';
import { CardChipComponent } from 'src/app/shared/icons/card-chip/card-chip.component';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, CardChipComponent],
})
export class AccountCardComponent {
  @Input() account!: Account;
  @Output() edit = new EventEmitter<Account>();

  get cardArt(): string | null {
    return this.account.background ? `url("${this.account.background}")` : null;
  }

  get art() {
    return (
      ACCOUNT_CARD_BACKGROUNDS.find(
        (background) => background.src === this.account.background
      ) ?? null
    );
  }
}
