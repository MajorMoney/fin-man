import { Injectable, signal } from '@angular/core';
import { SavingsApi } from 'src/api/savings.api';
import { reportCaughtError } from 'src/libs/core/http/report-caught-error';
import {
  SavingsGoal,
  SavingsGoalInput,
  VirtualTransaction,
  VirtualTransactionInput,
} from 'src/libs/core/models/savings';
import { todayIso } from 'src/libs/core/utils/savings.utils';
import { ConfirmService } from 'src/services/confirm.service';
import { ToastService } from 'src/services/toast.service';

/**
 * Savings goals and their virtual transactions. Everything here is stored on
 * the API; nothing touches real transactions or account balances.
 */
@Injectable({ providedIn: 'root' })
export class SavingsService {
  private readonly items = signal<SavingsGoal[]>([]);
  private readonly loadingState = signal(false);
  private readonly failed = signal(false);

  readonly goals = this.items.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly loadFailed = this.failed.asReadonly();

  constructor(
    private savingsApi: SavingsApi,
    private confirmService: ConfirmService,
    private toast: ToastService
  ) {}

  async refresh(): Promise<void> {
    this.loadingState.set(true);
    try {
      this.items.set(await this.savingsApi.findAllGoals());
      this.failed.set(false);
    } catch (error) {
      this.failed.set(true);
      reportCaughtError(this.toast, error, 'Failed to load savings goals');
    } finally {
      this.loadingState.set(false);
    }
  }

  findGoal(id: number): Promise<SavingsGoal> {
    return this.savingsApi.findGoal(id);
  }

  findTransactions(goalId: number): Promise<VirtualTransaction[]> {
    return this.savingsApi.findTransactions(goalId);
  }

  async createGoal(
    input: SavingsGoalInput,
    savedAmount?: number | null
  ): Promise<SavingsGoal> {
    const goal = await this.savingsApi.createGoal({
      ...input,
      savedAmount: savedAmount && savedAmount > 0 ? savedAmount : undefined,
      today: todayIso(),
    });
    await this.refresh();
    return goal;
  }

  async updateGoal(id: number, input: SavingsGoalInput): Promise<SavingsGoal> {
    const goal = await this.savingsApi.updateGoal(id, input);
    await this.refresh();
    return goal;
  }

  /** Asks first. Deleting a goal deletes its history. Resolves true when deleted. */
  async confirmDeleteGoal(goal: SavingsGoal): Promise<boolean> {
    const accepted = await this.confirmService.confirm({
      title: 'Delete savings goal',
      message: `Delete "${goal.name}" and its history of virtual transactions? Your accounts are not affected.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!accepted) return false;
    try {
      await this.savingsApi.removeGoal(goal.id);
    } catch {
      return false;
    }
    await this.refresh();
    return true;
  }

  async createTransaction(
    goalId: number,
    input: VirtualTransactionInput
  ): Promise<VirtualTransaction> {
    const transaction = await this.savingsApi.createTransaction(goalId, {
      ...input,
      today: todayIso(),
    });
    await this.refresh();
    return transaction;
  }

  async updateTransaction(
    goalId: number,
    id: number,
    input: VirtualTransactionInput
  ): Promise<VirtualTransaction> {
    const transaction = await this.savingsApi.updateTransaction(goalId, id, {
      ...input,
      today: todayIso(),
    });
    await this.refresh();
    return transaction;
  }

  /** Asks first. Removes the virtual transaction from the history. Resolves true when reverted. */
  async confirmRevertTransaction(
    goalId: number,
    transaction: VirtualTransaction,
    formattedAmount: string
  ): Promise<boolean> {
    const accepted = await this.confirmService.confirm({
      title: 'Revert virtual transaction',
      message: `Remove ${formattedAmount} dated ${transaction.date} from the history? The saved amount goes down by that much. Your accounts are not affected.`,
      confirmLabel: 'Revert',
      danger: true,
    });
    if (!accepted) return false;
    try {
      await this.savingsApi.revertTransaction(goalId, transaction.id);
    } catch {
      return false;
    }
    await this.refresh();
    return true;
  }
}
