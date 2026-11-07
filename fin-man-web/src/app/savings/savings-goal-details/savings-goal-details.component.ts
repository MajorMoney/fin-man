import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { reportCaughtError } from 'src/libs/core/http/report-caught-error';
import { SavingsGoal, VirtualTransaction } from 'src/libs/core/models/savings';
import { SavingsService } from 'src/services/savings.service';
import { ToastService } from 'src/services/toast.service';
import { SavingsGoalChartComponent } from '../savings-goal-chart/savings-goal-chart.component';
import { SavingsGoalModalComponent } from '../savings-goal-modal/savings-goal-modal.component';
import { SavingsGoalSummaryComponent } from '../savings-goal-summary/savings-goal-summary.component';
import { VirtualTransactionModalComponent } from '../virtual-transaction-modal/virtual-transaction-modal.component';

@Component({
  selector: 'app-savings-goal-details',
  templateUrl: './savings-goal-details.component.html',
  styleUrls: ['./savings-goal-details.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [CurrencyPipe],
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    SavingsGoalSummaryComponent,
    SavingsGoalChartComponent,
    SavingsGoalModalComponent,
    VirtualTransactionModalComponent,
  ],
})
export class SavingsGoalDetailsComponent implements OnInit {
  goal: SavingsGoal | null = null;
  transactions: VirtualTransaction[] = [];
  loading = true;
  notFound = false;

  isGoalModalOpen = false;
  isTransactionModalOpen = false;
  selectedTransaction: VirtualTransaction | null = null;

  private goalId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savingsService: SavingsService,
    private toast: ToastService,
    private currency: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.goalId = Number(params.get('id'));
      void this.load();
    });
  }

  async load(): Promise<void> {
    if (!Number.isFinite(this.goalId)) {
      this.loading = false;
      this.notFound = true;
      return;
    }
    try {
      const [goal, transactions] = await Promise.all([
        this.savingsService.findGoal(this.goalId),
        this.savingsService.findTransactions(this.goalId),
      ]);
      this.goal = goal;
      this.transactions = [...transactions].sort(
        (a, b) => b.date.localeCompare(a.date) || b.id - a.id
      );
      this.notFound = false;
    } catch (error) {
      this.goal = null;
      this.notFound = true;
      reportCaughtError(this.toast, error, 'Failed to load the savings goal');
    } finally {
      this.loading = false;
    }
  }

  openEditGoal(): void {
    this.isGoalModalOpen = true;
  }

  async deleteGoal(): Promise<void> {
    if (!this.goal) return;
    if (await this.savingsService.confirmDeleteGoal(this.goal)) {
      await this.router.navigate(['/savings']);
    }
  }

  openAddTransaction(): void {
    this.selectedTransaction = null;
    this.isTransactionModalOpen = true;
  }

  openEditTransaction(transaction: VirtualTransaction): void {
    this.selectedTransaction = { ...transaction };
    this.isTransactionModalOpen = true;
  }

  async revert(transaction: VirtualTransaction): Promise<void> {
    const amount =
      this.currency.transform(transaction.amount, 'EUR', 'symbol', '1.2-2') ??
      String(transaction.amount);
    if (
      await this.savingsService.confirmRevertTransaction(
        this.goalId,
        transaction,
        amount
      )
    ) {
      await this.load();
    }
  }
}
