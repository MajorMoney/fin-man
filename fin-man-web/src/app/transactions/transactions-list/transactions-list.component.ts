import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction } from 'src/libs/core/models/transactions';

import { TransactionFiltersForm } from 'src/libs/core/ui-models/transactions-list-filters';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

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
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css'],
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
      .pipe(
        map(([transactions, user, filters]) => {
          const filteredByUser = TransactionUtils.filterByUser(
            transactions,
            user.name
          );
          return TransactionUtils.applyFilters(filteredByUser, filters);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filteredExpenses) => {
        this.expenses = filteredExpenses;
        this.totalItems = filteredExpenses.length;
        this.calculateTotalPages();
        this.currentPage = 1; // Reset to first page when filters change
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
    if (this.sortColumn === column) {
      // Toggle through: asc -> desc -> null
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = null;
      }
    } else {
      // New column: start with ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.currentPage = 1; // Reset to first page when sorting
    this.updatePaginatedExpenses();
  }

  private applySorting(): void {
    if (!this.sortColumn || !this.sortDirection) {
      return; // No sorting applied
    }

    this.expenses.sort((a, b) => {
      const column = this.sortColumn!;
      let aValue: any = a[column];
      let bValue: any = b[column];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Special handling for dates
      if (column === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Special handling for numbers
      if (column === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // String comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Compare
      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      // Apply direction
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column) {
      return '⇅'; // Both arrows (unsorted)
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  isSorted(column: SortColumn): boolean {
    return this.sortColumn === column;
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
  }

  private updatePaginatedExpenses(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedExpenses = this.expenses.slice(startIndex, endIndex);
  }

  // Pagination controls
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedExpenses();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValue = +target.value;

    if (newValue && newValue > 0) {
      // Validate the value
      this.itemsPerPage = newValue;
      this.currentPage = 1; // Reset to first page
      this.calculateTotalPages();
      this.updatePaginatedExpenses();
    }
  }

  // Helper to generate page numbers for pagination UI
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with context
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

  trackById(index: number, item: Transaction): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
