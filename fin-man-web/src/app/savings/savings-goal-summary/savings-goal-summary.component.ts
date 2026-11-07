import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SavingsGoal } from 'src/libs/core/models/savings';
import {
  daysBetween,
  excessAmount,
  monthlyContribution,
  progressPercent,
  todayIso,
} from 'src/libs/core/utils/savings.utils';

/** Saved, target, progress, days left and current monthly contribution of a goal. */
@Component({
  selector: 'app-savings-goal-summary',
  templateUrl: './savings-goal-summary.component.html',
  styleUrls: ['./savings-goal-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyPipe],
})
export class SavingsGoalSummaryComponent {
  @Input({ required: true }) goal!: SavingsGoal;
  /** Show how far the saved amount is past the target. */
  @Input() showExcess = false;

  get today(): string {
    return todayIso();
  }

  /** Capped at 100 even when the saved amount exceeds the target. */
  get percent(): number {
    return progressPercent(this.goal.targetAmount, this.goal.savedAmount);
  }

  get percentLabel(): number {
    return this.percent >= 100 ? 100 : Math.floor(this.percent);
  }

  get excess(): number {
    return excessAmount(this.goal.targetAmount, this.goal.savedAmount);
  }

  get daysLeft(): number {
    return daysBetween(this.today, this.goal.targetDate);
  }

  get contribution(): number {
    return monthlyContribution(this.goal, this.today);
  }
}
