import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { combineLatest, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
import { RecurringTransactionFiltersForm } from 'src/libs/core/ui-models/recurring-transactions-list-filters';
import { RecurringTransactionsService } from 'src/services/recurring-transaction-service';
import { UserService } from 'src/services/user-service';
import { RecurringTransactionUtils } from 'src/libs/core/utils/recurring-transactions.utils';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ListViewUtils, SortDirection } from 'src/libs/core/utils/list-view.utils';

type SortColumn = 'date' | 'description' | 'amount' | 'account' | 'category' | 'notes' | 'user' | 'type';

@Component({
    selector: 'app-recurring-transactions-list',
    templateUrl: './recurring-transactions-list.component.html',
    styleUrls: ['./recurring-transactions-list.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, DecimalPipe, DatePipe]
})
export class RecurringTransactionsListComponent implements OnInit, OnDestroy {
  transactions: RecurringTransaction[] = [];
  paginatedTransactions: RecurringTransaction[] = [];

  @Input() filters$!: Observable<RecurringTransactionFiltersForm>;
  @Output() openEditModal: EventEmitter<RecurringTransaction>=new EventEmitter<RecurringTransaction>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 0;
  itemsPerPageOptions = [5, 10, 25, 50];

  // Sorting
  sortColumn: SortColumn | null = null;
  sortDirection: SortDirection = null;

  private destroy$ = new Subject<void>();

  constructor(
    private recurringTransactionsService: RecurringTransactionsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.recurringTransactionsService.recurringTransactions$,
      this.userService.currentUser$,
      this.filters$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([transactions, user, filters]) => {
        const filteredByUser = RecurringTransactionUtils.filterByUser(transactions, user.name);
        const filteredTransactions = RecurringTransactionUtils.applyFilters(filteredByUser, filters);
        this.transactions = filteredTransactions;
        this.totalItems = filteredTransactions.length;
        this.calculateTotalPages();
        this.currentPage = 1;
        this.applySorting();
        this.updatePaginatedTransactions();
      });
  }

  // Sorting
  onSort(column: SortColumn): void {
    const next = ListViewUtils.nextSortState(
      { column: this.sortColumn, direction: this.sortDirection },
      column
    );
    this.sortColumn = next.column;
    this.sortDirection = next.direction;
    this.applySorting();
    this.currentPage = 1;
    this.updatePaginatedTransactions();
  }

  private applySorting(): void {
    ListViewUtils.sortByColumn(
      this.transactions,
      this.sortColumn,
      this.sortDirection,
      (item, column) =>
        column === 'date'
          ? item.startDate
          : item[column as keyof RecurringTransaction]
    );
  }

  getSortIcon(column: SortColumn): string {
    return ListViewUtils.sortIcon(
      { column: this.sortColumn, direction: this.sortDirection },
      column
    );
  }

  private calculateTotalPages(): void {
    this.totalPages = ListViewUtils.totalPages(
      this.totalItems,
      this.itemsPerPage
    );
  }

  private updatePaginatedTransactions(): void {
    this.paginatedTransactions = ListViewUtils.pageSlice(
      this.transactions,
      this.currentPage,
      this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    if (!ListViewUtils.canGoToPage(page, this.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.updatePaginatedTransactions();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onItemsPerPageChange(event: Event): void {
    const value = ListViewUtils.itemsPerPageFromChange(event);
    if (value == null) {
      return;
    }
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedTransactions();
  }

  getPageNumbers(): number[] {
    return ListViewUtils.pageNumbers(this.currentPage, this.totalPages);
  }

  trackById(index: number, item: RecurringTransaction): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
