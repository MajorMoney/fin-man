import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from 'src/libs/core/models/accounts';
import { AccountsService } from 'src/services/account-service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-account-transfer-modal',
  templateUrl: './account-transfer-modal.component.html',
  styleUrls: ['./account-transfer-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, DecimalPipe],
})
export class AccountTransferModalComponent {
  @Input() isOpen = false;
  @Input() accounts: Account[] = [];
  @Output() closeModal = new EventEmitter<void>();

  fromAccountId: number | null = null;
  toAccountId: number | null = null;
  amount: number | null = null;
  notes = '';
  saving = false;

  constructor(
    private accountService: AccountsService,
    private toast: ToastService
  ) {}

  get fromAccount(): Account | undefined {
    return this.accounts.find((account) => account.id === this.fromAccountId);
  }

  get toAccount(): Account | undefined {
    return this.accounts.find((account) => account.id === this.toAccountId);
  }

  get fromOptions(): Account[] {
    return this.accounts.filter((account) => account.id !== this.toAccountId);
  }

  get toOptions(): Account[] {
    return this.accounts.filter((account) => account.id !== this.fromAccountId);
  }

  onClose(): void {
    if (this.saving) return;
    this.reset();
    this.closeModal.emit();
  }

  swapAccounts(): void {
    const fromAccountId = this.fromAccountId;
    this.fromAccountId = this.toAccountId;
    this.toAccountId = fromAccountId;
  }

  async onSave(): Promise<void> {
    const errors: string[] = [];
    if (this.fromAccountId == null) errors.push('From account is required.');
    if (this.toAccountId == null) errors.push('To account is required.');
    if (this.fromAccountId != null && this.fromAccountId === this.toAccountId) {
      errors.push('Choose two different accounts.');
    }
    if (this.amount == null || isNaN(this.amount) || this.amount <= 0) {
      errors.push('Amount must be greater than 0.');
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(this.amount))) {
      errors.push('Amount cannot have more than 2 decimal places.');
    }
    if (
      this.fromAccount &&
      this.amount != null &&
      this.amount > this.fromAccount.holdings
    ) {
      errors.push('Amount exceeds the available balance.');
    }
    if (errors.length) {
      this.toast.warning(errors.join('\n'));
      return;
    }

    const from = this.fromAccount;
    const to = this.toAccount;
    if (!from || !to || this.amount == null) return;

    this.saving = true;
    try {
      await this.accountService.transfer({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: this.amount,
        date: new Date().toISOString(),
        notes: this.notes.trim(),
      });
      this.saving = false;
      this.reset();
      this.closeModal.emit();
    } catch {
      this.saving = false;
    }
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  private reset(): void {
    this.fromAccountId = null;
    this.toAccountId = null;
    this.amount = null;
    this.notes = '';
  }
}
