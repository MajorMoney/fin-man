import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
import { Category } from 'src/libs/core/models/category';
import { CategoryService } from 'src/services/categories-service';
import { AccountsService } from 'src/services/account-service';
import { UserService } from 'src/services/user-service';
import { map } from 'rxjs';

@Component({
    selector: 'app-recurring-transactions-modal',
    templateUrl: './recurring-transactions-modal.component.html',
    styleUrls: ['./recurring-transactions-modal.component.css'],
    imports: [FormsModule, AsyncPipe],
})
export class RecurringTransactionsModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() transaction?: RecurringTransaction;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<RecurringTransaction>();
  @Output() delete = new EventEmitter<number>();
  constructor(
    private categoryService: CategoryService,
    private accountsService: AccountsService,
    private userService: UserService
  ) { }


  recurringForm!: Partial<RecurringTransaction>;

  filteredCategoryOptions: Category[] = [];
  categories: Category[] = [];
  users$ = this.userService.users$.pipe(
    map(users => users.filter(user => user.name !== 'All'))
  );
  filteredAccounts$ = this.accountsService.accounts$;

  frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  nextDueDate = '';


  ngOnInit(): void {
    this.categoryService.categories$.subscribe(c => (this.categories = c));
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transaction'] || changes['mode']) {
      this.initForm();
    }
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.recurringForm = this.transaction
      ? { ...this.transaction }
      : {
        amount: 0,
        description: '',
        category: '',
        account: '',
        startDate: today,
        recurrenceRule: 'monthly',
        type: 'expense',
        currency: 'EUR',
        notes: '',
        user: '',
      };

    this.calculateNextDueDate();
  }

  calculateNextDueDate(): void {
    if (!this.recurringForm.startDate || !this.recurringForm.recurrenceRule) {
      this.nextDueDate = '';
      return;
    }

    const date = new Date(this.recurringForm.startDate);
    switch (this.recurringForm.recurrenceRule) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    this.nextDueDate = date.toDateString();
  }

  onSave(): void {
    if (!this.recurringForm) return;

    // Validate required fields
    const {
      description,
      amount,
      user,
      account,
      category,
      startDate,
      recurrenceRule,
      type,
    } = this.recurringForm;

    if (
      !description ||
      !amount ||
      !user ||
      !account ||
      !category ||
      !startDate ||
      !recurrenceRule ||
      !type
    ) {
      alert('Please fill in all required fields');
      return;
    }

    // Optional: validate amount > 0
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    // Emit save event
    const { nextDueDate: _nextDueDate, ...payload } = this.recurringForm;
    this.save.emit(payload as RecurringTransaction);
  }

  onDelete(): void {
    if (!this.recurringForm?.id) return;

    if (
      confirm(
        `Are you sure you want to delete "${this.recurringForm.description}"?`,
      )
    ) {
      this.delete.emit(this.recurringForm.id);
    }
  }


  filterCategories(): void {
    const input = this.recurringForm?.category?.trim().toLowerCase() || '';
    this.filteredCategoryOptions = this.categories
      .filter((c) => c.name.toLowerCase().includes(input))
      .slice(0, 10); // limit max suggestions
  }

  selectCategory(name: string): void {
    if (this.recurringForm) {
      this.recurringForm.category = name;
      this.filteredCategoryOptions = [];
    }
  }

  async onCategoryBlur(): Promise<void> {
    const input = this.recurringForm?.category?.trim();
    if (!input) return;

    // Case-insensitive check if category exists
    const exists = CategoryService.exists(
      this.categories,
      input
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
          this.recurringForm!.category = '';
          console.error('Error creating category', err);
          alert('Failed to create category');
        }
      } else {
        // Clear input if user declines
        this.recurringForm!.category = '';
      }
    }
  }
}
