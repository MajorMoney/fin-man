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

type SortColumn = 'date' | 'description' | 'amount' | 'account' | 'category' | 'notes' | 'user' | 'type';
type SortDirection = 'asc' | 'desc' | null;

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
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? null : 'asc';
      if (!this.sortDirection) this.sortColumn = null;
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
    this.currentPage = 1;
    this.updatePaginatedTransactions();
  }

  private applySorting(): void {
    if (!this.sortColumn || !this.sortDirection) return;

    this.transactions.sort((a: any, b: any) => {
      let aValue = a[this.sortColumn!];
      let bValue = b[this.sortColumn!];

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (this.sortColumn === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (this.sortColumn === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column) return '⇅';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
  }

  private updatePaginatedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTransactions = this.transactions.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTransactions();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onItemsPerPageChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    if (value > 0) {
      this.itemsPerPage = value;
      this.currentPage = 1;
      this.calculateTotalPages();
      this.updatePaginatedTransactions();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (this.currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (this.currentPage >= this.totalPages - 2) {
        startPage = this.totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  trackById(index: number, item: RecurringTransaction): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
