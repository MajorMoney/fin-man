import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
} from 'rxjs';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
import { RecurringTransactionsApi } from 'src/api/recurring-transactions.api';

@Injectable({
  providedIn: 'root',
})
export class RecurringTransactionsService implements OnDestroy {
  private readonly recurringTransactionsSubject = new BehaviorSubject<
    RecurringTransaction[]
  >([]);
  public readonly recurringTransactions$: Observable<RecurringTransaction[]> =
    this.recurringTransactionsSubject
      .asObservable()
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      );

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly destroy$ = new Subject<void>();

  constructor(private recurringTransactionsApi: RecurringTransactionsApi) {
    this.initializeRecurringTransactions();
  }

  get recurringTransactions(): RecurringTransaction[] {
    return this.recurringTransactionsSubject.value;
  }
  get loading(): boolean {
    return this.loadingSubject.value;
  }
  get error(): string | null {
    return this.errorSubject.value;
  }

  async initializeRecurringTransactions(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const data = await this.recurringTransactionsApi.findAll();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
          'Invalid recurring transaction data: expected non-empty array'
        );
      }

      const validRecurringTransactions = data.filter((t) =>
        this.isValidRecurringTransaction(t)
      );
      if (validRecurringTransactions.length === 0) {
        throw new Error('No valid recurring transactions found');
      }

      this.recurringTransactionsSubject.next(validRecurringTransactions);
      this.loadingSubject.next(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load recurring transactions';
      console.error(
        '[RecurringTransactionsService] Initialization error:',
        message
      );
      this.errorSubject.next(message);
      this.recurringTransactionsSubject.next([]);
      this.loadingSubject.next(false);
    }
  }

  private isValidRecurringTransaction(t: any): boolean {
    return (
      t &&
      typeof t === 'object' &&
      'id' in t &&
      'type' in t &&
      'description' in t &&
      'amount' in t &&
      'category' in t &&
      'user' in t &&
      'frequency' in t &&
      'startDate' in t &&
      (t.type === 'income' || t.type === 'expense') &&
      (typeof t.id === 'number' || t.id === null) &&
      typeof t.description === 'string' &&
      typeof t.amount === 'number' &&
      typeof t.category === 'string' &&
      typeof t.user === 'string' &&
      typeof t.frequency === 'string' &&
      typeof t.startDate === 'string'
    );
  }

  setRecurringTransactions(
    recurringTransactions: RecurringTransaction[]
  ): void {
    const validRecurringTransactions = recurringTransactions.filter((t) =>
      this.isValidRecurringTransaction(t)
    );
    this.recurringTransactionsSubject.next(validRecurringTransactions);
    this.errorSubject.next(null);
  }

  refreshRecurringTransactions(): void {
    this.initializeRecurringTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.recurringTransactionsSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  // CRUD
  async addRecurringTransaction(t: RecurringTransaction): Promise<void> {
    await this.recurringTransactionsApi.create(t);
    this.refreshRecurringTransactions();
  }
  async updateRecurringTransaction(t: RecurringTransaction): Promise<void> {
    await this.recurringTransactionsApi.update(t);
    this.refreshRecurringTransactions();
  }
  async deleteRecurringTransaction(id: number): Promise<void> {
    await this.recurringTransactionsApi.remove(id);
    this.refreshRecurringTransactions();
  }
}
