import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { User } from 'src/libs/core/models/users';
import { UserService } from 'src/services/user-service';
import { ConfirmService } from 'src/services/confirm.service';
import { ToastService } from 'src/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-modal',
    templateUrl: './user-modal.component.html',
    styleUrls: ['./user-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule]
})
export class UserModalComponent implements OnChanges {
  constructor(
    private userService: UserService,
    private confirmService: ConfirmService,
    private toast: ToastService
  ) {}

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() isOpen = false;
  @Input() user?: User | null = null;

  @Output() closeModal = new EventEmitter<void>();

  editForm: User | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user && this.mode === 'edit') {
      this.editForm = { ...this.user };
    }

    if (this.mode === 'create') {
      this.editForm = {
        id: 0,
        name: '',
      };
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    if (!this.editForm) return;

    const errors: string[] = [];

    if (!this.editForm.name?.trim()) {
      errors.push('User name is required.');
    }

    if (errors.length > 0) {
      this.toast.warning(errors.join('\n'));
      return;
    }

    this.mode === 'create'
      ? this.userService.createUser(this.editForm)
      : this.userService.updateUser(this.editForm);

    this.onClose();
  }

  async onDelete(): Promise<void> {
    if (!this.editForm) return;
    const accepted = await this.confirmService.confirm({
      title: 'Delete user',
      message: `Delete user "${this.editForm.name}"?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!accepted) return;
    this.userService.deleteUser(this.editForm.id ?? 0);
    this.onClose();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
