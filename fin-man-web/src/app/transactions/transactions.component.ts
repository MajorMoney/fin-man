import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  takeUntil,
} from 'rxjs';
import { Account } from 'src/libs/core/models/accounts';
import {
  DEFAULT_TRANSACTION_FILTERS,
  TransactionFiltersForm,
} from 'src/libs/core/ui-models/transactions-list-filters';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { AccountsService } from 'src/services/account-service';
import { TransactionsService } from 'src/services/transactions-service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
})
export class TransactionsComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionsService,
    private accountService: AccountsService
  ) {
    this.initForm();
  }

  filtersForm!: FormGroup;
  private filtersSubject = new BehaviorSubject<TransactionFiltersForm>(
    DEFAULT_TRANSACTION_FILTERS
  );
  public filters$ = this.filtersSubject.asObservable();
  private destroy$ = new Subject<void>();
  public categories: string[] = [];
  public accounts: string[] = [];

  //MODAL HANDLER
  isCreateModalOpen: boolean = false;

  openAddModal() {
    this.isCreateModalOpen = true;
  }
  closeEditModal() {
    this.isCreateModalOpen = false;
  }

  ngOnInit(): void {
    // Get categories and accounts dynamically

    combineLatest([
      this.transactionService.transactions$,
      this.accountService.accounts$,
    ])
      .pipe(
        map(([transactions, accounts]) => {
          const uniqueCategories =
            TransactionUtils.getAllCategories(transactions);
          const uniqueAccounts = accounts.map((a) => a.name);
          return {
            categories: ['All', ...Array.from(uniqueCategories).sort()],
            accounts: ['All', ...Array.from(uniqueAccounts).sort()],
          };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(({ categories, accounts }) => {
        this.categories = categories;
        this.accounts = accounts;
      });

    // Watch form changes
    this.filtersForm.valueChanges
      .pipe(debounceTime(1), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((filters) => {
        if (this.filtersForm.valid) {
          this.filtersSubject.next(filters);
        }
      });

    // Emit initial value
    this.filtersSubject.next(this.filtersForm.value);
  }

  private initForm(): void {
    this.filtersForm = this.fb.group(
      {
        searchQuery: [DEFAULT_TRANSACTION_FILTERS.searchQuery],
        type: [DEFAULT_TRANSACTION_FILTERS.type],
        category: [DEFAULT_TRANSACTION_FILTERS.category],
        account: [DEFAULT_TRANSACTION_FILTERS.account],
        recurring: [DEFAULT_TRANSACTION_FILTERS.recurring],
        fromDate: [DEFAULT_TRANSACTION_FILTERS.fromDate],
        toDate: [DEFAULT_TRANSACTION_FILTERS.toDate],
        minAmount: [DEFAULT_TRANSACTION_FILTERS.minAmount, [Validators.min(0)]],
        maxAmount: [DEFAULT_TRANSACTION_FILTERS.maxAmount, [Validators.min(0)]],
      },
      {
        validators: this.dateRangeValidator,
      }
    );
  }

  private dateRangeValidator(
    group: FormGroup
  ): { [key: string]: boolean } | null {
    const fromDate = group.get('fromDate')?.value;
    const toDate = group.get('toDate')?.value;

    if (fromDate && toDate && fromDate > toDate) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  clearFilters(): void {
    this.filtersForm.reset(DEFAULT_TRANSACTION_FILTERS);
    this.filtersSubject.next(DEFAULT_TRANSACTION_FILTERS);
  }

  // Getter for easy access in template
  get isDateRangeInvalid(): boolean {
    return (
      this.filtersForm.hasError('dateRangeInvalid') &&
      this.filtersForm.get('fromDate')?.touched === true &&
      this.filtersForm.get('toDate')?.touched === true
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtersSubject.complete();
  }
}
