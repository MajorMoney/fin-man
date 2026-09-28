import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-accounts-total',
  templateUrl: './accounts-total.component.html',
  styleUrls: ['./accounts-total.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe],
})
export class AccountsTotalComponent {
  totalHoldings = 86550;
  currency = 'EUR';
}
