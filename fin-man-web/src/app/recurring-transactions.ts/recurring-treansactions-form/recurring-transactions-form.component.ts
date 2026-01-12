import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
import { Category } from 'src/libs/core/models/category';
import { RecurringTransactionsService } from 'src/services/recurring-transaction-service';
import { CategoryService } from 'src/services/categories-service';
import { AccountsService } from 'src/services/account-service';
import { UserService } from 'src/services/user-service';
import { UserHelpers } from 'src/libs/core/models/users';

@Component({
  selector: 'app-recurring-transactions',
  templateUrl: './recurring-transactions-form.component.html',
  styleUrls: ['./recurring-transactions-form.component.css'],
})
export class RecurringTransactionsFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  recurringForm: Partial<RecurringTransaction> = {
    amount: 0,
    description: '',
    category: '',
    account: '',
    startDate: '',
    recurrenceRule: 'monthly',
    endDate: undefined,
    type: 'expense',
    currency: 'EUR',
    notes: '',
    user: '',
  };

  recurringTransactions: RecurringTransaction[] = [];

  frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  nextDueDate: string = '';
  loading: boolean = false;
  error: string | null = null;

  categories: Category[] = [];

  constructor(
    private recurringService: RecurringTransactionsService,
    private categoryService: CategoryService,
    private accountService: AccountsService,
    private userService: UserService
  ) {}

  private recurringFormChange$ = new Subject<void>();

  /** Observables */
  users$ = this.userService.users$;
  categories$ = this.categoryService.categories$;
  selectedUser$!: Subject<string | null>;
  filteredAccounts$!: Subject<any>;

  ngOnInit(): void {
    // Subscribe to recurring transactions
    this.recurringService.recurringTransactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactions) => {
        this.recurringTransactions = transactions;
      });

    // Subscribe to loading state
    this.loading = this.recurringService.loading;

    // Subscribe to error state
    this.error = this.recurringService.error;

    // Subscribe to categories
    this.categoryService.categories$.subscribe((cats) => {
      this.categories = cats;
    });

    this.users$ = this.userService.users$.pipe(
      map((users) => users.filter((u) => !UserHelpers.isAllUsers(u)))
    );
    // Track selected user
    this.selectedUser$ = this.recurringFormChange$.pipe(
      startWith(null),
      map(() => this.recurringForm?.user ?? null)
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

    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    this.recurringForm.startDate = today;
    this.calculateNextDueDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateNextDueDate(): void {
    if (!this.recurringForm.startDate || !this.recurringForm.recurrenceRule) {
      this.nextDueDate = '';
      return;
    }

    const startDate = new Date(this.recurringForm.startDate);
    const nextDate = new Date(startDate);

    switch (this.recurringForm.recurrenceRule) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    this.nextDueDate = nextDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  onFrequencyChange(): void {
    this.calculateNextDueDate();
  }

  onStartDateChange(): void {
    this.calculateNextDueDate();
  }

  async onSave(): Promise<void> {
    const errors: string[] = [];

    if (!this.recurringForm.amount || this.recurringForm.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    if (!this.recurringForm.description?.trim()) {
      errors.push('Description is required');
    }
    if (!this.recurringForm.category) {
      errors.push('Category is required');
    }
    if (!this.recurringForm.account) {
      errors.push('Payment method is required');
    }
    if (!this.recurringForm.startDate) {
      errors.push('Start date is required');
    }
    if (!this.recurringForm.user) {
      errors.push('User is required');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      await this.recurringService.addRecurringTransaction({
        ...this.recurringForm,
        id: 0,
      } as RecurringTransaction);
      alert('Recurring transaction created successfully!');
      this.resetForm();
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      alert(error);
    }
  }

  async onDelete(id: number): Promise<void> {
    if (
      !confirm('Are you sure you want to delete this recurring transaction?')
    ) {
      return;
    }

    try {
      await this.recurringService.deleteRecurringTransaction(id);
      alert('Recurring transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      alert('Failed to delete recurring transaction');
    }
  }

  resetForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.recurringForm = {
      amount: 0,
      description: '',
      category: '',
      account: '',
      startDate: today,
      recurrenceRule: 'monthly',
      endDate: undefined,
      type: 'expense',
      currency: 'EUR',
      notes: '',
      user: '',
    };
    this.calculateNextDueDate();
  }
}
