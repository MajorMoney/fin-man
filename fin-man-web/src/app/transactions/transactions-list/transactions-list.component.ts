import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction } from 'src/libs/core/models/transactions';

import { TransactionFiltersForm } from 'src/libs/core/ui-models/transactions-list-filters';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';
import { FormsModule } from '@angular/forms';
import { TransactionModalComponent } from '../transactions-modal/transactions-modal.component';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ListViewUtils, SortDirection } from 'src/libs/core/utils/list-view.utils';

// Add these type definitions here
type SortColumn =
  | 'date'
  | 'description'
  | 'amount'
  | 'account'
  | 'category'
  | 'notes'
  | 'user'
  | 'type';

@Component({
    selector: 'app-transactions-list',
    templateUrl: './transactions-list.component.html',
    styleUrls: ['./transactions-list.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, TransactionModalComponent, DecimalPipe, DatePipe]
})
export class TransactionsListComponent implements OnInit, OnDestroy {
  expenses: Transaction[] = [];
  paginatedExpenses: Transaction[] = [];

  @Input() filters$!: Observable<TransactionFiltersForm>;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 0;

  // Items per page options
  itemsPerPageOptions = [5, 10, 25, 50, 100];

  sortColumn: SortColumn | null = null;
  sortDirection: SortDirection = null;

  // Modal
  isEditModalOpen = false;
  editingTransaction: Transaction | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.transactionsService.transactions$,
      this.userService.currentUser$,
      this.filters$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([transactions, user, filters]) => {
        const filteredByUser = TransactionUtils.filterByUser(
          transactions,
          user.name
        );
        const filteredExpenses = TransactionUtils.applyFilters(
          filteredByUser,
          filters
        );
        this.expenses = filteredExpenses;
        this.totalItems = filteredExpenses.length;
        this.calculateTotalPages();
        this.currentPage = 1;
        this.applySorting();
        this.updatePaginatedExpenses();
      });
  }

  // Modal handlers
  openEditModal(expense: Transaction): void {
    this.editingTransaction = expense;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingTransaction = null;
  }

  // Sorting methods
  onSort(column: SortColumn): void {
    const next = ListViewUtils.nextSortState(
      { column: this.sortColumn, direction: this.sortDirection },
      column
    );
    this.sortColumn = next.column;
    this.sortDirection = next.direction;
    this.applySorting();
    this.currentPage = 1;
    this.updatePaginatedExpenses();
  }

  private applySorting(): void {
    ListViewUtils.sortByColumn(
      this.expenses,
      this.sortColumn,
      this.sortDirection
    );
  }

  getSortIcon(column: SortColumn): string {
    return ListViewUtils.sortIcon(
      { column: this.sortColumn, direction: this.sortDirection },
      column
    );
  }

  isSorted(column: SortColumn): boolean {
    return this.sortColumn === column;
  }

  private calculateTotalPages(): void {
    this.totalPages = ListViewUtils.totalPages(
      this.totalItems,
      this.itemsPerPage
    );
  }

  private updatePaginatedExpenses(): void {
    this.paginatedExpenses = ListViewUtils.pageSlice(
      this.expenses,
      this.currentPage,
      this.itemsPerPage
    );
  }

  // Pagination controls
  goToPage(page: number): void {
    if (!ListViewUtils.canGoToPage(page, this.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.updatePaginatedExpenses();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onItemsPerPageChange(event: Event): void {
    const newValue = ListViewUtils.itemsPerPageFromChange(event);
    if (newValue == null) {
      return;
    }
    this.itemsPerPage = newValue;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedExpenses();
  }

  getPageNumbers(): number[] {
    return ListViewUtils.pageNumbers(this.currentPage, this.totalPages);
  }

  trackById(index: number, item: Transaction): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
