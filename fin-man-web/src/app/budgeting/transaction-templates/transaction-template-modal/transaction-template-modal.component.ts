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
import { Account } from 'src/libs/core/models/accounts';
import { CategoryBudget, TransactionTemplate } from 'src/libs/core/models/budget';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-transaction-template-modal',
  templateUrl: './transaction-template-modal.component.html',
  styleUrls: ['./transaction-template-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class TransactionTemplateModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() categories: CategoryBudget[] = [];
  @Input() accounts: Account[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<TransactionTemplate, 'id'>>();

  readonly intervals = ['Weekly', 'Monthly', 'Yearly'];

  title = '';
  category = '';
  interval = 'Monthly';
  account = '';
  amount: number | null = null;

  constructor(private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) this.reset();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  onSave(): void {
    const errors: string[] = [];
    if (!this.title.trim()) errors.push('Title is required.');
    if (!this.category) errors.push('Category is required.');
    if (!this.interval) errors.push('Recurring interval is required.');
    if (!this.account) errors.push('Default account is required.');
    if (this.amount == null || isNaN(this.amount) || this.amount <= 0) {
      errors.push('Amount must be greater than 0.');
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(this.amount))) {
      errors.push('Amount cannot have more than 2 decimal places.');
    }
    if (errors.length) {
      this.toast.warning(errors.join('\n'));
      return;
    }

    const match = this.categories.find((item) => item.name === this.category);
    const account = this.accounts.find((item) => item.name === this.account);
    this.save.emit({
      title: this.title.trim(),
      category: this.category,
      account: this.account,
      holder: account?.holders[0] ?? '',
      amount: this.amount as number,
      kind: 'expense',
      interval: this.interval,
      icon: match?.icon ?? 'cart',
    });
  }

  private reset(): void {
    this.title = '';
    this.category = this.categories[0]?.name ?? '';
    this.interval = 'Monthly';
    this.account = this.accounts[0]?.name ?? '';
    this.amount = null;
  }
}
