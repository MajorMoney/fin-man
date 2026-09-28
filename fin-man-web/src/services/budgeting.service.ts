import { Injectable, signal } from '@angular/core';
import { BudgetsApi, CreateBudgetRequest, UpdateBudgetRequest } from 'src/api/budgets.api';
import { reportCaughtError } from 'src/libs/core/http/report-caught-error';
import {
  BudgetTemplate,
  TransactionTemplate,
} from 'src/libs/core/models/budget';
import { ToastService } from 'src/services/toast.service';

const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  {
    id: 1,
    title: 'Monthly Rent',
    category: 'Housing / Rent',
    account: 'Main',
    holder: 'Pedro',
    amount: 1200,
    kind: 'expense',
    interval: 'Monthly',
    icon: 'home',
  },
  {
    id: 2,
    title: 'Grocery Shopping',
    category: 'Food & Groceries',
    account: 'Main',
    holder: 'Rita',
    amount: 150,
    kind: 'expense',
    interval: 'Weekly',
    icon: 'cart',
  },
  {
    id: 3,
    title: 'Salary — Pedro',
    category: 'Income',
    account: 'Main',
    holder: 'Pedro',
    amount: 3800,
    kind: 'income',
    interval: 'Monthly',
    icon: 'bag',
  },
  {
    id: 4,
    title: 'Netflix Subscription',
    category: 'Subscriptions',
    account: 'Main',
    holder: 'Pedro',
    amount: 15,
    kind: 'expense',
    interval: 'Monthly',
    icon: 'refresh',
  },
  {
    id: 5,
    title: 'Shared Refund',
    category: 'Subscriptions',
    account: 'Main',
    holder: 'Both',
    amount: 45,
    kind: 'income',
    interval: 'Monthly',
    icon: 'refresh',
  },
  {
    id: 6,
    title: 'Freelance Income',
    category: 'Income',
    account: 'Savings',
    holder: 'Rita',
    amount: 500,
    kind: 'income',
    interval: 'Monthly',
    icon: 'bag',
  },
];

@Injectable({ providedIn: 'root' })
export class BudgetingService {
  private readonly budgetState = signal<BudgetTemplate[]>([]);
  private readonly templateState = signal<TransactionTemplate[]>(
    TRANSACTION_TEMPLATES
  );

  readonly budgets = this.budgetState.asReadonly();
  readonly transactionTemplates = this.templateState.asReadonly();

  constructor(
    private budgetsApi: BudgetsApi,
    private toast: ToastService
  ) {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const budgets = await this.budgetsApi.findAll();
      this.budgetState.set(Array.isArray(budgets) ? budgets : []);
    } catch (error) {
      reportCaughtError(this.toast, error, 'Failed to load budgets');
    }
  }

  async create(dto: CreateBudgetRequest): Promise<void> {
    try {
      await this.budgetsApi.create(dto);
      await this.refresh();
    } catch (error) {
      reportCaughtError(this.toast, error, 'Failed to save budget');
    }
  }

  async update(id: number, dto: UpdateBudgetRequest): Promise<void> {
    const current = this.budgets().find((budget) => budget.id === id);
    if (current?.isOthers && (dto.category != null || dto.icon != null)) {
      this.toast.warning('Only the Others limit can be changed.');
      return;
    }
    try {
      await this.budgetsApi.update(id, dto);
      await this.refresh();
    } catch (error) {
      reportCaughtError(this.toast, error, 'Failed to update budget');
    }
  }

  async remove(id: number): Promise<void> {
    if (this.budgets().find((budget) => budget.id === id)?.isOthers) {
      this.toast.warning('The Others budget cannot be deleted.');
      return;
    }
    try {
      await this.budgetsApi.remove(id);
      await this.refresh();
    } catch (error) {
      reportCaughtError(this.toast, error, 'Failed to delete budget');
    }
  }

  addTemplate(template: Omit<TransactionTemplate, 'id'>): void {
    this.templateState.update((templates) => [
      ...templates,
      { ...template, id: Date.now() },
    ]);
  }
}
