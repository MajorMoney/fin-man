import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { budgetBarColor } from 'src/libs/core/models/budget';

@Component({
  selector: 'app-budget-gauge',
  templateUrl: './budget-gauge.component.html',
  styleUrls: ['./budget-gauge.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyPipe],
})
export class BudgetGaugeComponent {
  @Input() spent = 0;
  @Input() budget = 0;
  @Input() percent = 0;

  get shown(): number {
    return Math.min(Math.max(this.percent, 0), 100);
  }

  get color(): string {
    return budgetBarColor(this.percent);
  }
}
