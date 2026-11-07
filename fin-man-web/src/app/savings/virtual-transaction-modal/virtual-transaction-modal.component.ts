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
import { VirtualTransaction } from 'src/libs/core/models/savings';
import {
  hasValidDecimals,
  isValidIsoDate,
  todayIso,
} from 'src/libs/core/utils/savings.utils';
import { SavingsService } from 'src/services/savings.service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-virtual-transaction-modal',
  templateUrl: './virtual-transaction-modal.component.html',
  styleUrls: ['../savings-modal.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class VirtualTransactionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() goalId = 0;
  /** The virtual transaction being edited. Null adds a new one. */
  @Input() transaction: VirtualTransaction | null = null;
  @Output() closeModal = new EventEmitter<void>();
  /** Emitted after the virtual transaction is persisted. */
  @Output() saved = new EventEmitter<VirtualTransaction>();

  amount: number | null = null;
  date = '';
  note = '';
  maxDate = todayIso();
  saving = false;

  constructor(
    private savingsService: SavingsService,
    private toast: ToastService
  ) {}

  get editing(): boolean {
    return this.transaction != null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen && (changes['isOpen'] || changes['transaction'])) {
      this.fill();
    }
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
      amount: this.amount as number,
      date: this.date,
      note: this.note.trim(),
    };

    this.saving = true;
    try {
      const saved = this.transaction
        ? await this.savingsService.updateTransaction(
            this.goalId,
            this.transaction.id,
            input
          )
        : await this.savingsService.createTransaction(this.goalId, input);
      this.saving = false;
      this.saved.emit(saved);
      this.closeModal.emit();
    } catch {
      this.saving = false;
    }
  }

  private validate(): string[] {
    const errors: string[] = [];
    if (this.amount == null || isNaN(this.amount) || this.amount <= 0) {
      errors.push('Amount must be greater than 0.');
    } else if (!hasValidDecimals(this.amount)) {
      errors.push('Amount cannot have more than 2 decimal places.');
    }

    if (!isValidIsoDate(this.date)) {
      errors.push('Date is required.');
    } else if (this.date > todayIso()) {
      errors.push('Date cannot be in the future.');
    }
    return errors;
  }

  private fill(): void {
    this.saving = false;
    this.maxDate = todayIso();
    this.amount = this.transaction?.amount ?? null;
    this.date = this.transaction?.date ?? this.maxDate;
    this.note = this.transaction?.note ?? '';
  }
}
