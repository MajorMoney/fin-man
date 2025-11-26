import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Category } from 'src/libs/core/models/category';
import { Transaction } from 'src/libs/core/models/transactions';
import { UserHelpers } from 'src/libs/core/models/users';
import { AccountsService } from 'src/services/account-service';
import { CategoryService } from 'src/services/categories-service';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-transactions-modal',
  templateUrl: './transactions-modal.component.html',
  styleUrls: ['./transactions-modal.component.css'],
})
export class TransactionModalComponent implements OnChanges, OnInit {
  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService,
    private accountService: AccountsService,
    private categoryService: CategoryService
  ) {}

  @Input() mode: 'create' | 'edit' = 'edit';
  @Input() isOpen = false;
  @Input() transaction?: Transaction | null = null;
  @Output() closeModal = new EventEmitter<void>();

  /** Concrete form object for template binding */
  editForm: Transaction | null = null;

  categories: Category[] = [];
  /** Subject to emit whenever the user changes */
  private editFormChange$ = new Subject<void>();

  /** Observables */
  users$ = this.userService.users$;
  categories$ = this.categoryService.categories$;
  selectedUser$!: Subject<string | null>;
  filteredAccounts$!: Subject<any>;

  ngOnInit(): void {
    // Filter users excluding "all users"
    this.users$ = this.userService.users$.pipe(
      map((users) => users.filter((u) => !UserHelpers.isAllUsers(u)))
    );

    // Filter categories to only 'expense'
    this.categoryService.categories$.subscribe((cats) => {
      this.categories = cats;
    });

    // Track selected user
    this.selectedUser$ = this.editFormChange$.pipe(
      startWith(null),
      map(() => this.editForm?.user ?? null)
    ) as unknown as Subject<string | null>;

    // Filter accounts based on selected user
    this.filteredAccounts$ = combineLatest([
      this.accountService.accounts$,
      this.selectedUser$,
    ]).pipe(
      map(([accounts, selectedUser]) => {
        if (!selectedUser) return accounts;
        return accounts.filter((acc) => acc.holders.includes(selectedUser));
      })
    ) as unknown as Subject<any>;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transaction']) {
      if (this.transaction) {
        this.editForm = { ...this.transaction };
      }
    }

    if (this.mode === 'create') {
      this.editForm = {
        id: 0,
        type: 'expense',
        date: '',
        description: '',
        amount: 0,
        currency: 'EUR',
        account: '',
        category: '',
        notes: '',
        user: '',
        recurring: false,
        recurrenceRule: '',
        endDate: '',
      };
    }

    this.editFormChange$.next();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onOpen(): void {
    this.isOpen = true;
  }

  /** Create a new expense */
  onCreate() {
    if (!this.editForm) return;

    const errors: string[] = [];

    if (!this.editForm.description?.trim())
      errors.push('Description is required.');
    if (
      !this.editForm.amount ||
      isNaN(this.editForm.amount) ||
      this.editForm.amount <= 0
    )
      errors.push('Amount must be a positive number.');
    if (!this.editForm.user?.trim()) errors.push('User is required.');
    if (!this.editForm.category?.trim()) errors.push('Category is required.');
    if (!this.editForm.date || isNaN(Date.parse(this.editForm.date)))
      errors.push('A valid date is required.');

    if (this.editForm.recurring && !this.editForm.recurrenceRule) {
      errors.push('Recurrence rule is required for recurring transactions.');
    }
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    this.transactionsService.addTransaction({ ...this.editForm, id: 0 });
    this.onClose();
  }

  /** Save existing expense */
  onSave(): void {
    if (!this.editForm) return;

    if (
      !this.editForm.description ||
      (this.editForm.recurring && !this.editForm.recurrenceRule) ||
      !this.editForm.amount ||
      !this.editForm.user ||
      !this.editForm.account ||
      !this.editForm.category
    ) {
      alert('Please fill in all required fields');
      return;
    }

    this.transactionsService.updateTransaction(this.editForm);
    this.onClose();
  }

  /** Delete expense */
  onDelete(): void {
    if (!this.editForm) return;

    if (
      confirm(`Are you sure you want to delete "${this.editForm.description}"?`)
    ) {
      this.transactionsService.deleteTransaction(this.editForm.id);
      this.onClose();
    }
  }

  /** Called whenever user changes */
  onUserChange(): void {
    this.editFormChange$.next();
  }

  filteredCategoryOptions: Category[] = [];

  filterCategories(): void {
    const input = this.editForm?.category?.trim().toLowerCase() || '';
    this.filteredCategoryOptions = this.categories
      .filter((c) => c.name.toLowerCase().includes(input))
      .slice(0, 10); // limit max suggestions
  }

  selectCategory(name: string): void {
    if (this.editForm) {
      this.editForm.category = name;
      this.filteredCategoryOptions = [];
    }
  }

  async onCategoryBlur(): Promise<void> {
    const input = this.editForm?.category?.trim();
    if (!input) return;

    // Case-insensitive check if category exists
    const exists = CategoryService.exists(
      this.categories,
      input.toLocaleLowerCase()
    );

    if (!exists) {
      const create = confirm(
        `You selected a category that doesn't exist. Do you want to create category '${input}'?`
      );
      if (create) {
        // Decide default type or ask user
        const newCategory: Category = {
          id: 0, // id will be generated by backend
          name: input,
          type: 'expense', // you can set default type or ask user
        };

        try {
          await this.categoryService.addCategory(newCategory);
          alert(`Category '${input}' created successfully!`);
        } catch (err) {
          // Clear input if creation fails
          this.editForm!.category = '';
          console.error('Error creating category', err);
          alert('Failed to create category');
        }
      } else {
        // Clear input if user declines
        this.editForm!.category = '';
      }
    }
  }
}
