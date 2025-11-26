import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
} from 'rxjs';
import { Transaction } from 'src/libs/core/models/transactions';
import { TransactionsApi } from 'src/api/transactions.api';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService implements OnDestroy {
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public readonly transactions$: Observable<Transaction[]> =
    this.transactionsSubject
      .asObservable()
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      );

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly destroy$ = new Subject<void>();

  constructor(private transactionsApi: TransactionsApi) {
    this.initializeTransactions();
  }

  get transactions(): Transaction[] {
    return this.transactionsSubject.value;
  }
  get loading(): boolean {
    return this.loadingSubject.value;
  }
  get error(): string | null {
    return this.errorSubject.value;
  }

  async initializeTransactions(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const data = await this.transactionsApi.findAll();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid transaction data: expected non-empty array');
      }

      const validTransactions = data.filter((t) => this.isValidTransaction(t));
      if (validTransactions.length === 0) {
        throw new Error('No valid transactions found');
      }

      this.transactionsSubject.next(validTransactions);
      this.loadingSubject.next(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load transactions';
      console.error('[TransactionsService] Initialization error:', message);
      this.errorSubject.next(message);
      this.transactionsSubject.next([]);
      this.loadingSubject.next(false);
    }
  }

  private isValidTransaction(t: any): boolean {
    return (
      t &&
      typeof t === 'object' &&
      'id' in t &&
      'type' in t &&
      'date' in t &&
      'description' in t &&
      'amount' in t &&
      'category' in t &&
      'user' in t &&
      (t.type === 'income' || t.type === 'expense') &&
      (typeof t.id === 'number' || t.id === null) &&
      typeof t.date === 'string' &&
      typeof t.description === 'string' &&
      typeof t.amount === 'number' &&
      typeof t.category === 'string' &&
      typeof t.user === 'string'
    );
  }

  setTransactions(transactions: Transaction[]): void {
    const validTransactions = transactions.filter((t) =>
      this.isValidTransaction(t)
    );
    this.transactionsSubject.next(validTransactions);
    this.errorSubject.next(null);
  }

  refreshTransactions(): void {
    this.initializeTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.transactionsSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  // CRUD
  async addTransaction(t: Transaction): Promise<void> {
    await this.transactionsApi.create(t);
    this.refreshTransactions();
  }
  async updateTransaction(t: Transaction): Promise<void> {
    await this.transactionsApi.update(t);
    this.refreshTransactions();
  }
  async deleteTransaction(id: number): Promise<void> {
    await this.transactionsApi.remove(id);
    this.refreshTransactions();
  }
}
