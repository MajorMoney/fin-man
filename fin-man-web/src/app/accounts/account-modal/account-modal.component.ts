import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { Account } from 'src/libs/core/models/accounts';
import { User } from 'src/libs/core/models/users';
import { AccountsService } from 'src/services/account-service';
import { ConfirmService } from 'src/services/confirm.service';
import { ToastService } from 'src/services/toast.service';
import { FormsModule } from '@angular/forms';
import { AccountBackgroundPickerComponent } from '../account-background-picker/account-background-picker.component';

@Component({
    selector: 'app-account-modal',
    templateUrl: './account-modal.component.html',
    styleUrls: ['./account-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, AccountBackgroundPickerComponent]
})
export class AccountModalComponent implements OnChanges {
  constructor(
    private accountService: AccountsService,
    private confirmService: ConfirmService,
    private toast: ToastService
  ) {}
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() isOpen = false;
  @Input() account?: Account | null = null;
  @Input() users: User[] = [];

  @Output() closeModal = new EventEmitter<void>();

  accounts: Account[] = [];

  editForm: Account | null = null;
  isBackgroundPickerOpen = false;

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
    this.isBackgroundPickerOpen = false;
    this.closeModal.emit();
  }

  openBackgroundPicker(): void {
    this.isBackgroundPickerOpen = true;
  }

  closeBackgroundPicker(): void {
    this.isBackgroundPickerOpen = false;
  }

  selectBackground(src: string): void {
    if (!this.editForm) return;
    this.editForm = { ...this.editForm, background: src };
    this.isBackgroundPickerOpen = false;
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
    if (!this.editForm.holders?.length) {
      errors.push('At least one holder is required.');
    }
    if (errors.length) {
      this.toast.warning(errors.join('\n'));
      return;
    }

    if (this.mode === 'edit' && this.editForm.background) {
      this.accountService.rememberBackground(
        this.editForm.id,
        this.editForm.background
      );
    }
    this.mode === 'create'
      ? this.accountService.addAccount(this.editForm)
      : this.accountService.updateAccount(this.editForm);
    this.onClose();
  }

  async onDelete(): Promise<void> {
    if (!this.editForm) return;
    const accepted = await this.confirmService.confirm({
      title: 'Delete account',
      message: `Delete account "${this.editForm.name}"?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!accepted) return;
    this.accountService.deleteAccount(this.editForm.id);
    this.onClose();
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
