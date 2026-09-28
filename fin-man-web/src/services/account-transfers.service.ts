import { Injectable, signal } from '@angular/core';
import { AccountTransfersApi } from 'src/api/account-transfers.api';
import { reportCaughtError } from 'src/libs/core/http/report-caught-error';
import { AccountTransfer } from 'src/libs/core/models/account-transfers';
import { ToastService } from 'src/services/toast.service';

@Injectable({ providedIn: 'root' })
export class AccountTransfersService {
  private readonly items = signal<AccountTransfer[]>([]);
  readonly accountTransfers = this.items.asReadonly();

  constructor(
    private accountTransfersApi: AccountTransfersApi,
    private toast: ToastService,
  ) {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      this.items.set(await this.accountTransfersApi.findAll());
    } catch (error) {
      reportCaughtError(this.toast, error, 'Failed to load account transfers');
    }
  }
}
