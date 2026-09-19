import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
import { DEFAULT_RECURRING_TRANSACTION_FILTERS, RecurringTransactionFiltersForm } from 'src/libs/core/ui-models/recurring-transactions-list-filters';
import { RecurringTransactionsService } from 'src/services/recurring-transaction-service';
import { RecurringTransactionsModalComponent } from './recurring-transactions-modal/recurring-transactions-modal.component';
import { RecurringTransactionsFiltersComponent } from './recurring-transactions-filters/recurring-transactions-filters.component';
import { RecurringTransactionsListComponent } from './recurring-transactions-list/recurring-transactions-list.component';

@Component({
    selector: 'app-recurring-transaction',
    templateUrl: './recurring-transactions.component.html',
    styleUrls: ['./recurring-transactions.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RecurringTransactionsFiltersComponent, RecurringTransactionsListComponent, RecurringTransactionsModalComponent]
})
export class RecurringTransactionsComponent {
  constructor(private service: RecurringTransactionsService) { }


  private filtersSubject =
    new BehaviorSubject<RecurringTransactionFiltersForm>(
      DEFAULT_RECURRING_TRANSACTION_FILTERS
    );

  filters$ = this.filtersSubject.asObservable().pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selected?: RecurringTransaction;



  handleFiltersChange(updatedFilters: RecurringTransactionFiltersForm) {
    this.filtersSubject.next(updatedFilters);
  }

  openCreate() {
    this.modalMode = 'create';
    this.selected = undefined;
    this.isModalOpen = true;
  }

  openEdit(tx: RecurringTransaction) {
    this.modalMode = 'edit';
    this.selected = tx;
    this.isModalOpen = true;
  }

  async save(tx: RecurringTransaction) {
    await this.modalMode === 'create'
      ? this.service.addRecurringTransaction(tx)
      : this.service.updateRecurringTransaction(tx);

    this.isModalOpen = false;
  }

  async onDelete(id: number) {
    await this.service.deleteRecurringTransaction(id);
    this.isModalOpen = false;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
  

}
