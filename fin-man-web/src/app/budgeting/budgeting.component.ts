import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { Account } from 'src/libs/core/models/accounts';
import {
  budgetMonthParts,
  BudgetPeriod,
  BudgetSummary,
  CategoryBudget,
  deriveCategoryBudgets,
  incomeInPeriod,
  summarizeBudgets,
  TransactionTemplate,
} from 'src/libs/core/models/budget';
import { AccountsService } from 'src/services/account-service';
import { BudgetingService } from 'src/services/budgeting.service';
import { ToastService } from 'src/services/toast.service';
import { TransactionsService } from 'src/services/transactions-service';
import { BudgetFormValue } from './category-budget-list/category-budget-modal/category-budget-modal.component';
import { BudgetGaugeComponent } from './budget-gauge/budget-gauge.component';
import { BudgetToolbarComponent } from './budget-toolbar/budget-toolbar.component';
import { CategoryBudgetListComponent } from './category-budget-list/category-budget-list.component';
import { TransactionTemplatesComponent } from './transaction-templates/transaction-templates.component';
import { YearlyOverviewComponent } from './yearly-overview/yearly-overview.component';

@Component({
  selector: 'app-budgeting',
  templateUrl: './budgeting.component.html',
  styleUrls: ['./budgeting.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BudgetToolbarComponent,
    CategoryBudgetListComponent,
    BudgetGaugeComponent,
    YearlyOverviewComponent,
    TransactionTemplatesComponent,
  ],
})
export class BudgetingComponent implements OnInit, OnDestroy {
  readonly period = signal<BudgetPeriod>('monthly');
  readonly month = signal(currentBudgetMonth());
  accounts: Account[] = [];

  private readonly destroy$ = new Subject<void>();
  private readonly transactions;

  constructor(
    private budgeting: BudgetingService,
    private accountService: AccountsService,
    private transactionsService: TransactionsService,
    private toast: ToastService
  ) {
    this.transactions = toSignal(this.transactionsService.transactions$, {
      initialValue: [],
    });
  }

  ngOnInit(): void {
    this.accountService.accounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((accounts) => {
        this.accounts = accounts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get visibleCategories(): CategoryBudget[] {
    return deriveCategoryBudgets(
      this.budgeting.budgets(),
      this.transactions(),
      this.period(),
      this.month()
    );
  }

  get summary(): BudgetSummary {
    return summarizeBudgets(this.visibleCategories);
  }

  get overviewIncome(): number {
    const parts = budgetMonthParts(this.month());
    if (!parts) return 0;
    const month = this.period() === 'yearly' ? null : parts.month;
    return incomeInPeriod(this.transactions(), parts.year, month);
  }

  get overviewBudget(): number {
    const monthly = this.budgeting
      .budgets()
      .reduce((sum, budget) => sum + budget.limit, 0);
    return this.period() === 'yearly' ? monthly * 12 : monthly;
  }

  get accountOptions(): Account[] {
    if (this.accounts.length) return this.accounts;
    return [
      { id: 1, name: 'Main', holdings: 0, holders: ['Pedro'] },
      { id: 2, name: 'Savings', holdings: 0, holders: ['Rita'] },
    ];
  }

  get projectedSavings(): number {
    return this.overviewIncome - this.overviewBudget;
  }

  get actualSavings(): number {
    return this.overviewIncome - this.summary.totalSpent;
  }

  get templates(): TransactionTemplate[] {
    return this.budgeting.transactionTemplates();
  }

  saveCategory(category: BudgetFormValue): void {
    if (category.isOthers) return;
    if (category.id == null) {
      void this.budgeting.create({
        category: category.name,
        limit: category.limit,
        icon: category.icon,
      });
      return;
    }
    void this.budgeting.update(category.id, {
      category: category.name,
      limit: category.limit,
      icon: category.icon,
    });
  }

  saveOthersLimit(category: BudgetFormValue): void {
    if (category.id == null) return;
    void this.budgeting.update(category.id, { limit: category.limit });
  }

  onSaveBudget(category: BudgetFormValue): void {
    if (category.isOthers) {
      this.saveOthersLimit(category);
      return;
    }
    this.saveCategory(category);
  }

  deleteCategory(id: number): void {
    void this.budgeting.remove(id);
  }

  saveTemplate(template: Omit<TransactionTemplate, 'id'>): void {
    this.budgeting.addTemplate(template);
  }

  applyTemplate(template: TransactionTemplate): void {
    this.toast.success(`${template.title} applied.`);
  }
}

function currentBudgetMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}
