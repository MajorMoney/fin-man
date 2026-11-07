import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SavingsGoal } from 'src/libs/core/models/savings';
import { SavingsGoalSummaryComponent } from '../savings-goal-summary/savings-goal-summary.component';

@Component({
  selector: 'app-savings-goal-card',
  templateUrl: './savings-goal-card.component.html',
  styleUrls: ['./savings-goal-card.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SavingsGoalSummaryComponent],
})
export class SavingsGoalCardComponent {
  @Input({ required: true }) goal!: SavingsGoal;
  @Output() details = new EventEmitter<SavingsGoal>();
  @Output() edit = new EventEmitter<SavingsGoal>();
  @Output() remove = new EventEmitter<SavingsGoal>();
}
