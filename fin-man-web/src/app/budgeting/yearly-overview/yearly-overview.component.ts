import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BudgetPeriod } from 'src/libs/core/models/budget';

@Component({
  selector: 'app-yearly-overview',
  templateUrl: './yearly-overview.component.html',
  styleUrls: ['./yearly-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyPipe],
})
export class YearlyOverviewComponent {
  @Input() period: BudgetPeriod = 'monthly';
  @Input() income = 0;
  @Input() budget = 0;
  @Input() savings = 0;
  @Input() actual = 0;

  get label(): string {
    return this.period === 'yearly' ? 'Yearly' : 'Monthly';
  }
}
