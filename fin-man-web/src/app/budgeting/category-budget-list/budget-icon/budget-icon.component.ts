import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BudgetIcon } from 'src/libs/core/models/budget';

@Component({
  selector: 'app-budget-icon',
  templateUrl: './budget-icon.component.html',
  styleUrls: ['./budget-icon.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class BudgetIconComponent {
  @Input() name: BudgetIcon = 'home';
}
