import {
  ChangeDetectionStrategy,
  Component,
  effect,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AccountTransfer } from 'src/libs/core/models/account-transfers';
import {
  ListViewUtils,
  SortDirection,
} from 'src/libs/core/utils/list-view.utils';
import { AccountsService } from 'src/services/account-service';
import { AccountTransfersService } from 'src/services/account-transfers.service';

type SortColumn = 'date' | 'fromAccount' | 'toAccount' | 'amount' | 'notes';

@Component({
  selector: 'app-account-transfers-history',
  templateUrl: './account-transfers-history.component.html',
  styleUrls: ['./account-transfers-history.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, DecimalPipe],
})
export class AccountTransfersHistoryComponent {
  accountTransfers: AccountTransfer[] = [];
  paginatedAccountTransfers: AccountTransfer[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 0;
  itemsPerPageOptions = [5, 10, 25, 50];

  sortColumn: SortColumn | null = null;
  sortDirection: SortDirection = null;

  constructor(
    private accountTransfersService: AccountTransfersService,
    private accountService: AccountsService,
  ) {
    effect(() => {
      this.accountTransfers = this.accountTransfersService
        .accountTransfers()
        .map((accountTransfer) => ({ ...accountTransfer }));
      this.applySorting();
      this.totalItems = this.accountTransfers.length;
      this.calculateTotalPages();
      this.updatePage();
    });
  }

  onSort(column: SortColumn): void {
    const next = ListViewUtils.nextSortState(
      { column: this.sortColumn, direction: this.sortDirection },
      column
    );
    this.sortColumn = next.column;
    this.sortDirection = next.direction;
    this.applySorting();
    this.currentPage = 1;
    this.updatePage();
  }

  getSortIcon(column: SortColumn): string {
    return ListViewUtils.sortIcon(
      { column: this.sortColumn, direction: this.sortDirection },
      column
    );
  }

  goToPage(page: number): void {
    if (!ListViewUtils.canGoToPage(page, this.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.updatePage();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  revert(accountTransfer: AccountTransfer): Promise<void> {
    return this.accountService.revertAccountTransfer(accountTransfer.id);
  }

  onItemsPerPageChange(event: Event): void {
    const value = ListViewUtils.itemsPerPageFromChange(event);
    if (value == null) {
      return;
    }
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePage();
  }

  getPageNumbers(): number[] {
    return ListViewUtils.pageNumbers(this.currentPage, this.totalPages);
  }

  private applySorting(): void {
    ListViewUtils.sortByColumn(
      this.accountTransfers,
      this.sortColumn,
      this.sortDirection
    );
  }

  private calculateTotalPages(): void {
    this.totalPages = ListViewUtils.totalPages(
      this.totalItems,
      this.itemsPerPage
    );
  }

  private updatePage(): void {
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    this.paginatedAccountTransfers = ListViewUtils.pageSlice(
      this.accountTransfers,
      this.currentPage,
      this.itemsPerPage
    );
  }
}
