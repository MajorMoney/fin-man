import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SavingsGoal } from 'src/libs/core/models/savings';
import {
  hasValidDecimals,
  isValidIsoDate,
  todayIso,
} from 'src/libs/core/utils/savings.utils';
import { SavingsService } from 'src/services/savings.service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-savings-goal-modal',
  templateUrl: './savings-goal-modal.component.html',
  styleUrls: ['../savings-modal.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class SavingsGoalModalComponent implements OnChanges {
  @Input() isOpen = false;
  /** The goal being edited. Null creates a new goal. */
  @Input() goal: SavingsGoal | null = null;
  @Output() closeModal = new EventEmitter<void>();
  /** Emitted after the goal is persisted. */
  @Output() saved = new EventEmitter<SavingsGoal>();

  name = '';
  description = '';
  targetAmount: number | null = null;
  targetDate = '';
  savedAmount: number | null = null;
  saving = false;

  constructor(
    private savingsService: SavingsService,
    private toast: ToastService
  ) {}

  get editing(): boolean {
    return this.goal != null;
  }

  /** A goal cannot target a day before it was created. */
  get minDate(): string {
    return this.goal?.createdOn ?? todayIso();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen && (changes['isOpen'] || changes['goal'])) this.fill();
  }

  onClose(): void {
    if (this.saving) return;
    this.closeModal.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  async onSave(): Promise<void> {
    if (this.saving) return;
    const errors = this.validate();
    if (errors.length) {
      this.toast.warning(errors.join('\n'));
      return;
    }

    const input = {
      name: this.name.trim(),
      description: this.description.trim(),
      targetAmount: this.targetAmount as number,
      targetDate: this.targetDate,
    };

    this.saving = true;
    try {
      const goal = this.goal
        ? await this.savingsService.updateGoal(this.goal.id, input)
        : await this.savingsService.createGoal(input, this.savedAmount);
      this.saving = false;
      this.saved.emit(goal);
      this.closeModal.emit();
    } catch {
      this.saving = false;
    }
  }

  private validate(): string[] {
    const errors: string[] = [];
    if (!this.name.trim()) errors.push('Name is required.');

    if (
      this.targetAmount == null ||
      isNaN(this.targetAmount) ||
      this.targetAmount <= 0
    ) {
      errors.push('Target amount must be greater than 0.');
    } else if (!hasValidDecimals(this.targetAmount)) {
      errors.push('Target amount cannot have more than 2 decimal places.');
    }

    if (!isValidIsoDate(this.targetDate)) {
      errors.push('Target date is required.');
    } else if (this.targetDate < this.minDate) {
      errors.push(
        this.editing
          ? 'Target date cannot be before the day the goal was created.'
          : 'Target date cannot be in the past.'
      );
    }

    if (!this.editing && this.savedAmount != null && this.savedAmount !== 0) {
      if (isNaN(this.savedAmount) || this.savedAmount < 0) {
        errors.push('Already saved cannot be negative.');
      } else if (!hasValidDecimals(this.savedAmount)) {
        errors.push('Already saved cannot have more than 2 decimal places.');
      }
    }
    return errors;
  }

  private fill(): void {
    this.saving = false;
    this.name = this.goal?.name ?? '';
    this.description = this.goal?.description ?? '';
    this.targetAmount = this.goal?.targetAmount ?? null;
    this.targetDate = this.goal?.targetDate ?? '';
    this.savedAmount = null;
  }
}
