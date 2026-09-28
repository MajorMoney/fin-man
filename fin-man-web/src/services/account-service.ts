import { Injectable, OnDestroy } from '@angular/core';
import { Account } from 'src/libs/core/models/accounts';
import { AccountTransferRequest } from 'src/libs/core/models/account-transfers';
import { AccountsApi } from 'src/api/accounts.api';
import { AccountTransfersService } from 'src/services/account-transfers.service';
import { reportCaughtError } from 'src/libs/core/http/report-caught-error';
import { ToastService } from 'src/services/toast.service';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountsService implements OnDestroy {

  constructor(
    private accountsApi: AccountsApi,
    private accountTransfersService: AccountTransfersService,
    private toast: ToastService
  ) {
    this.initializeAccounts();
  }

  private readonly accountsSubject = new BehaviorSubject<Account[]>([]);
  public readonly accounts$: Observable<Account[]> = this.accountsSubject
    .asObservable()
    .pipe(
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      )
    );

  get accounts(): Account[] {
    return this.accountsSubject.value;
  }

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly destroy$ = new Subject<void>();

  public readonly loading$: Observable<boolean> =
    this.loadingSubject.asObservable();
  public readonly error$: Observable<string | null> =
    this.errorSubject.asObservable();

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
  get error(): string | null {
    return this.errorSubject.value;
  }

  private async initializeAccounts(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const accountsData = await this.accountsApi.findAll();

      // Validate initial account data
      if (!Array.isArray(accountsData) || accountsData.length === 0) {
        throw new Error(
          'Invalid account data format: expected a non-empty array'
        );
      }

      // Filter valid accounts
      const validAccounts = accountsData.filter((acc) =>
        this.isValidAccount(acc)
      );

      if (validAccounts.length === 0) {
        throw new Error('No valid accounts found in data');
      }

      this.accountsSubject.next(this.withBackgrounds(validAccounts));

      this.loadingSubject.next(false);
    } catch (error) {
      const errorMessage = reportCaughtError(
        this.toast,
        error,
        'Failed to load accounts'
      );
      console.error('[AccountsService] Initialization error:', errorMessage);
      this.errorSubject.next(errorMessage);
      this.loadingSubject.next(false);

      // Fallback to empty array
      this.accountsSubject.next([]);
    }
  }

  /**
   * Validate account object structure
   */
  private isValidAccount(account: any): boolean {
    return (
      account !== null &&
      typeof account === 'object' &&
      'id' in account &&
      'name' in account &&
      'holdings' in account &&
      'holders' in account &&
      (typeof account.id === 'number' || account.id === null) &&
      typeof account.name === 'string' &&
      account.name.trim().length > 0 &&
      typeof account.holdings === 'number' &&
      Array.isArray(account.holders)
    );
  }

  /**
   * Set the current list of accounts
   */
  setAccounts(accounts: Account[]): void {
    if (!Array.isArray(accounts)) {
      console.warn('[AccountsService] Attempted to set invalid accounts array');
      this.errorSubject.next('Invalid accounts array');
      return;
    }

    // Filter valid accounts
    const validAccounts = accounts.filter((acc) => this.isValidAccount(acc));

    if (validAccounts.length === 0) {
      console.error('[AccountsService] No valid accounts to set');
      this.errorSubject.next('No valid accounts found');
      this.accountsSubject.next([]);
      return;
    }

    const accountsWithBackgrounds = this.withBackgrounds(validAccounts);
    console.log('[AccountsService] Accounts updated:', accountsWithBackgrounds);
    this.accountsSubject.next(accountsWithBackgrounds);
    this.errorSubject.next(null);
  }

  rememberBackground(accountId: number, background: string): void {
    const stored = this.readStoredBackgrounds();
    stored[String(accountId)] = background;
    localStorage.setItem(this.backgroundStorageKey, JSON.stringify(stored));
    this.accountsSubject.next(this.withBackgrounds(this.accounts));
  }

  private readonly backgroundStorageKey = 'finman.accountBackgrounds';

  private readStoredBackgrounds(): Record<string, string> {
    try {
      const raw = localStorage.getItem(this.backgroundStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private withBackgrounds(accounts: Account[]): Account[] {
    const stored = this.readStoredBackgrounds();
    return accounts.map((account) => ({
      ...account,
      background: account.background || stored[String(account.id)],
    }));
  }

  refreshAccounts(): Promise<void> {
    return this.initializeAccounts();
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.accountsSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  // CRUD operations
  async addAccount(account: Account): Promise<void> {
    const a = await this.accountsApi.create(account);
    this.refreshAccounts();
  }

  async updateAccount(account: Account): Promise<void> {
    await this.accountsApi.update(account);
    this.refreshAccounts();
  }

  async transfer(request: AccountTransferRequest): Promise<void> {
    await this.accountsApi.transfer(request);
    await this.refreshAccounts();
    await this.accountTransfersService.refresh();
  }

  async revertAccountTransfer(id: number): Promise<void> {
    await this.accountsApi.revertAccountTransfer(id);
    await this.refreshAccounts();
    await this.accountTransfersService.refresh();
  }

  async deleteAccount(id: number): Promise<void> {
    await this.accountsApi.remove(id);
    this.refreshAccounts();
  }
}
