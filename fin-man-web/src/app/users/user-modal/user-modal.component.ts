import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { User } from 'src/libs/core/models/users';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css'],
})
export class UserModalComponent implements OnChanges {
  constructor(private userService: UserService) {}

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
      alert(errors.join('\n'));
      return;
    }

    this.mode === 'create'
      ? this.userService.createUser(this.editForm)
      : this.userService.updateUser(this.editForm);

    this.onClose();
  }

  onDelete(): void {
    if (!this.editForm) return;

    if (confirm(`Delete user "${this.editForm.name}"?`)) {
      this.userService.deleteUser(this.editForm.id ?? 0);
      this.onClose();
    }
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
