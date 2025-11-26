import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Account } from 'src/libs/core/models/accounts';
import { User } from 'src/libs/core/models/users';
import { AccountsService } from 'src/services/account-service';

@Component({
  selector: 'app-account-modal',
  templateUrl: './account-modal.component.html',
  styleUrls: ['./account-modal.component.css'],
})
export class AccountModalComponent implements OnChanges {
  constructor(private accountService: AccountsService) {}
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() isOpen = false;
  @Input() account?: Account | null = null;
  @Input() users: User[] = [];

  @Output() closeModal = new EventEmitter<void>();

  accounts: Account[] = [];

  editForm: Account | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Edit mode
    if (this.mode === 'edit' && this.account) {
      this.editForm = {
        ...this.account,
        holders: [...(this.account.holders || [])],
      };
      return;
    }

    // Create mode
    if (this.mode === 'create') {
      this.editForm = {
        id: 0,
        name: '',
        holdings: 0,
        holders: [],
      };
    }
  }
  onClose(): void {
    this.closeModal.emit();
  }

  // --- Holder helpers ---
  isHolder(user: string): boolean {
    return this.editForm?.holders.includes(user) ?? false;
  }

  toggleHolder(user: User) {
    if (!this.editForm) return;

    const name = user.name;

    if (this.editForm.holders.includes(name)) {
      this.editForm.holders = this.editForm.holders.filter((h) => h !== name);
    } else {
      this.editForm.holders = [...this.editForm.holders, name];
    }
  }

  onSave(): void {
    if (!this.editForm) return;
    const errors: string[] = [];
    if (!this.editForm.name?.trim()) errors.push('Account name is required.');
    if (this.editForm.holdings == null || isNaN(this.editForm.holdings)) {
      errors.push('Holdings must be a valid number.');
    }
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    this.mode === 'create'
      ? this.accountService.addAccount(this.editForm)
      : this.accountService.updateAccount(this.editForm);
    this.onClose();
  }

  onDelete(): void {
    if (!this.editForm) return;
    if (confirm(`Delete account "${this.editForm.name}"?`)) {
      this.accountService.deleteAccount(this.editForm.id);
      this.onClose();
    }
  }

  onContentClick(event: Event) {
    event.stopPropagation();
  }
  selectAllHolders() {
    if (!this.editForm) return;
    this.editForm.holders = this.users.map((u) => u.name);
  }
  clearHolders() {
    if (!this.editForm) return;
    this.editForm.holders = [];
  }
}
