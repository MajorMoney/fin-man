import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { SavingsGoal, VirtualTransaction } from 'src/libs/core/models/savings';
import { formatEuro } from 'src/libs/core/utils/money';
import {
  buildBurnup,
  excessAmount,
  formatDayLabel,
  isValidIsoDate,
  monthlyContribution,
  remainingAmount,
  todayIso,
} from 'src/libs/core/utils/savings.utils';
import { SavingsService } from 'src/services/savings.service';

type PaceTone = 'behind' | 'ok' | 'past';

interface GoalPaceRow {
  id: number;
  name: string;
  saved: string;
  target: string;
  targetDate: string;
  savedPercent: number;
  pacePercent: number | null;
  tone: PaceTone;
  status: string;
}

@Component({
  selector: 'app-goal-pace',
  templateUrl: './goal-pace.component.html',
  styleUrls: ['./goal-pace.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class GoalPaceComponent {
  private readonly savings = inject(SavingsService);
  private generation = 0;

  readonly rows = signal<GoalPaceRow[]>([]);
  readonly loaded = signal(false);

  constructor() {
    void this.savings.refresh();
    effect(() => {
      const goals = this.savings.goals();
      if (this.savings.loading()) return;
      const generation = ++this.generation;
      this.loaded.set(false);
      void this.load(goals, generation);
    });
  }

  private async load(goals: SavingsGoal[], generation: number): Promise<void> {
    await Promise.resolve();
    if (generation !== this.generation) return;
    const rows = await Promise.all(
      goals.map(async (goal) => {
        try {
          return this.toRow(goal, await this.savings.findTransactions(goal.id));
        } catch {
          return this.toRow(goal, null);
        }
      })
    );
    if (generation !== this.generation) return;
    this.rows.set(rows);
    this.loaded.set(true);
  }

  private toRow(
    goal: SavingsGoal,
    transactions: VirtualTransaction[] | null
  ): GoalPaceRow {
    const saved = goal.savedAmount;
    const target = goal.targetAmount;
    const scale = Math.max(target, saved, 0);
    const savedPercent = scale > 0 ? Math.min(100, (saved / scale) * 100) : 0;
    const past = excessAmount(target, saved) > 0;
    const targetDate = isValidIsoDate(goal.targetDate)
      ? formatDayLabel(goal.targetDate)
      : goal.targetDate;
    const base = {
      id: goal.id,
      name: goal.name,
      saved: formatEuro(saved),
      target: formatEuro(target),
      targetDate,
      savedPercent,
    };

    if (!transactions) {
      return {
        ...base,
        pacePercent: null,
        tone: past ? 'past' : 'ok',
        status: past
          ? `${formatEuro(excessAmount(target, saved))} past the target`
          : 'Pace unavailable',
      };
    }

    const today = todayIso();
    const burnup = buildBurnup(goal, transactions, today, 'monthly');
    const monthly = monthlyContribution(goal, today);
    const due =
      remainingAmount(target, saved) > 0
        ? `${formatEuro(monthly)} due this month`
        : '';
    const pacePercent =
      scale > 0 ? Math.min(100, Math.max(0, (burnup.planned / scale) * 100)) : null;

    if (past) {
      return {
        ...base,
        pacePercent: null,
        tone: 'past',
        status: `${formatEuro(excessAmount(target, saved))} past the target`,
      };
    }

    const behind = burnup.gap > 0;
    const pace = behind
      ? `${formatEuro(burnup.gap)} behind`
      : burnup.gap < 0
        ? 'Ahead'
        : 'On pace';
    return {
      ...base,
      pacePercent,
      tone: behind ? 'behind' : 'ok',
      status: due ? `${pace} · ${due}` : pace,
    };
  }
}
