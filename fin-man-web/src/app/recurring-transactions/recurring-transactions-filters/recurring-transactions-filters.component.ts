import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { RecurringTransactionFiltersForm, DEFAULT_RECURRING_TRANSACTION_FILTERS } from 'src/libs/core/ui-models/recurring-transactions-list-filters';
import { RecurringTransactionUtils } from 'src/libs/core/utils/recurring-transactions.utils';
import { AccountsService } from 'src/services/account-service';
import { RecurringTransactionsService } from 'src/services/recurring-transaction-service';

@Component({
    selector: 'app-recurring-transactions-filters',
    templateUrl: './recurring-transactions-filters.component.html',
    styleUrls: ['./recurring-transactions-filters.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule]
})
export class RecurringTransactionsFiltersComponent {
  @Output() filtersChange = new EventEmitter<RecurringTransactionFiltersForm>();
  @Output() addButtonClick = new EventEmitter<void>();


  constructor(private fb: FormBuilder,
    private transactionService: RecurringTransactionsService,
    private accountService: AccountsService) { }
  form!: FormGroup;

  public categories: string[] = [];
  public accounts: string[] = [];


  ngOnInit(): void {

    combineLatest([
      this.transactionService.recurringTransactions$,
      this.accountService.accounts$,
    ])
      .pipe(
        map(([transactions, accounts]) => {
          const uniqueCategories =
            RecurringTransactionUtils.getAllCategories(transactions);
          const uniqueAccounts = accounts.map((a) => a.name);
          return {
            categories: ['All', ...Array.from(uniqueCategories).sort()],
            accounts: ['All', ...Array.from(uniqueAccounts).sort()],
          };
        })
      )
      .subscribe(({ categories, accounts }) => {
        this.categories = categories;
        this.accounts = accounts;
      });


    this.form = this.fb.group({
      searchQuery: [DEFAULT_RECURRING_TRANSACTION_FILTERS.searchQuery],
      type: [DEFAULT_RECURRING_TRANSACTION_FILTERS.type],
      category: [DEFAULT_RECURRING_TRANSACTION_FILTERS.category],
      account: [DEFAULT_RECURRING_TRANSACTION_FILTERS.account],
      fromDate: [DEFAULT_RECURRING_TRANSACTION_FILTERS.fromDate],
      toDate: [DEFAULT_RECURRING_TRANSACTION_FILTERS.toDate],
      minAmount: [DEFAULT_RECURRING_TRANSACTION_FILTERS.minAmount],
      maxAmount: [DEFAULT_RECURRING_TRANSACTION_FILTERS.maxAmount],
      startDate: [DEFAULT_RECURRING_TRANSACTION_FILTERS.startDate],
      recurrenceRule: [DEFAULT_RECURRING_TRANSACTION_FILTERS.recurrenceRule],
      endDate: [DEFAULT_RECURRING_TRANSACTION_FILTERS.endDate],
    });

    // Emit changes whenever the form updates
    this.form.valueChanges.subscribe((value) => this.filtersChange.emit(value));
  }


  handleClearFilters(): void {
    this.form.reset(DEFAULT_RECURRING_TRANSACTION_FILTERS)
  }

  handleAddButtonClick(): void {
    this.addButtonClick.emit();
  }
}