import { SavingsGoal, VirtualTransaction } from '../models/savings';
import { TransactionUtils } from './transactions.utils';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const pad = (value: number): string => String(value).padStart(2, '0');

function parts(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

/** Calendar date (YYYY-MM-DD) in the browser's local time zone. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

export function isValidIsoDate(value: string | null | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { year, month, day } = parts(value);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Whole days from one calendar date to another. Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = parts(from);
  const b = parts(to);
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) -
      Date.UTC(a.year, a.month - 1, a.day)) /
      MS_PER_DAY
  );
}

/** "8 Nov" when `withDay` is set, otherwise "Nov '26". */
export function formatMonthLabel(iso: string, withDay: boolean): string {
  const { year, month, day } = parts(iso);
  const name = TransactionUtils.MONTHS[month - 1];
  return withDay ? `${day} ${name}` : `${name} '${pad(year % 100)}`;
}

/** "8 Nov '26". */
export function formatDayLabel(iso: string): string {
  const { year } = parts(iso);
  return `${formatMonthLabel(iso, true)} '${pad(year % 100)}`;
}

/** Calendar date `days` after `iso`. Negative counts backward. */
export function addDays(iso: string, days: number): string {
  const { year, month, day } = parts(iso);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

/** Calendar months from the month of `from` to the month of `to`. Same month is 0. */
export function monthsBetween(from: string, to: string): number {
  const a = parts(from);
  const b = parts(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + toCents(amount), 0) / 100;
}

export function hasValidDecimals(amount: number): boolean {
  return /^\d+(\.\d{1,2})?$/.test(String(amount));
}

/** What is still missing to reach the target. Never negative. */
export function remainingAmount(target: number, saved: number): number {
  return Math.max(toCents(target) - toCents(saved), 0) / 100;
}

/** How far the saved amount is past the target. Zero until it is exceeded. */
export function excessAmount(target: number, saved: number): number {
  return Math.max(toCents(saved) - toCents(target), 0) / 100;
}

/** Progress as a percentage. Capped at 100 even when the goal is exceeded. */
export function progressPercent(target: number, saved: number): number {
  if (!(target > 0)) return 0;
  return Math.min(Math.max((saved / target) * 100, 0), 100);
}

/**
 * Remaining amount divided by the whole calendar months from today through the
 * target month. In the target month (or after it) the full remainder is due.
 */
export function monthlyContribution(
  goal: Pick<SavingsGoal, 'targetAmount' | 'targetDate' | 'savedAmount'>,
  today: string
): number {
  const remaining = remainingAmount(goal.targetAmount, goal.savedAmount);
  const months = monthsBetween(today, goal.targetDate);
  return months > 0 ? remaining / months : remaining;
}

/** A corner of the cumulative step line. `x` is whole days from the chart start. */
export interface BurnupPoint {
  x: number;
  y: number;
}

/** `total` keeps the goal flat. `monthly` raises it by one installment each month. */
export type BurnupGoal = 'total' | 'monthly';

export interface Burnup {
  start: string;
  end: string;
  /** Days from the start to the end. Zero when both fall on the same day. */
  span: number;
  goal: number;
  mode: BurnupGoal;
  /** Corners of the cumulative amount, from the start through today. */
  steps: BurnupPoint[];
  /** Corners of the goal line across the whole chart. */
  plan: BurnupPoint[];
  /** Days from the start to today. The cursor sits here. */
  cursor: number;
  /** Cumulative amount at the cursor. */
  current: number;
  /** Planned amount at the cursor. The flat target, or the monthly total due by today. */
  planned: number;
  /** Planned amount minus the cumulative amount. Negative when ahead of the plan. */
  gap: number;
  /** Amount dated before the goal was created. Already included in the first step. */
  savedBefore: number;
}

interface StepCents {
  x: number;
  cents: number;
}

function pushStep(steps: StepCents[], point: StepCents): void {
  const last = steps[steps.length - 1];
  if (last && last.x === point.x && last.cents === point.cents) return;
  steps.push(point);
}

function monthStart(iso: string, offset: number): string {
  const { year, month } = parts(iso);
  const index = year * 12 + (month - 1) + offset;
  const shiftedYear = Math.floor(index / 12);
  const shiftedMonth = (index % 12) + 1;
  return `${String(shiftedYear).padStart(4, '0')}-${pad(shiftedMonth)}-01`;
}

function centsAt(steps: StepCents[], day: number): number {
  let cents = steps[0]?.cents ?? 0;
  for (const step of steps) {
    if (step.x > day) break;
    cents = step.cents;
  }
  return cents;
}

/**
 * Cumulative monthly plan. One installment is added at each month boundary
 * from creation through the target date. The last installment lands on the
 * target date and brings the line to the full target.
 */
function buildMonthlyPlan(
  start: string,
  targetDate: string,
  targetCents: number,
  span: number
): StepCents[] {
  const months = Math.max(monthsBetween(start, targetDate), 0);
  const installments = Math.max(months, 1);
  const installment = Math.floor(targetCents / installments);
  const plan: StepCents[] = [];
  let running = 0;
  pushStep(plan, { x: 0, cents: 0 });

  if (months === 0) {
    const day = Math.min(Math.max(daysBetween(start, targetDate), 0), span);
    pushStep(plan, { x: day, cents: 0 });
    running = targetCents;
    pushStep(plan, { x: day, cents: running });
  } else {
    for (let index = 1; index <= months; index++) {
      const boundary = index === months ? targetDate : monthStart(start, index);
      const day = Math.min(Math.max(daysBetween(start, boundary), 0), span);
      const next = index === months ? targetCents : running + installment;
      pushStep(plan, { x: day, cents: running });
      running = next;
      pushStep(plan, { x: day, cents: running });
    }
  }

  pushStep(plan, { x: span, cents: running });
  return plan;
}

/**
 * Burnup from the day the goal was created. Each deposit is a step in the
 * cumulative amount and stops at today. `total` draws the goal as a flat
 * line. `monthly` draws it as the cumulative monthly installments through
 * the target date.
 */
export function buildBurnup(
  goal: Pick<SavingsGoal, 'createdOn' | 'targetAmount' | 'targetDate'>,
  transactions: Pick<VirtualTransaction, 'amount' | 'date'>[],
  today: string,
  mode: BurnupGoal = 'total'
): Burnup {
  const start = goal.createdOn;
  const later = mode === 'monthly' && goal.targetDate > today ? goal.targetDate : today;
  const end = later < start ? start : later;
  const span = Math.max(daysBetween(start, end), 0);
  const cursor = Math.min(Math.max(daysBetween(start, today), 0), span);

  const ordered = [...transactions].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );

  let beforeCents = 0;
  const inRange: { day: number; cents: number }[] = [];
  for (const transaction of ordered) {
    if (transaction.date < start) {
      beforeCents += toCents(transaction.amount);
      continue;
    }
    const day = daysBetween(start, transaction.date);
    inRange.push({
      day: Math.min(Math.max(day, 0), cursor),
      cents: toCents(transaction.amount),
    });
  }

  let running = beforeCents;
  const steps: StepCents[] = [];
  pushStep(steps, { x: 0, cents: running });
  for (const transaction of inRange) {
    pushStep(steps, { x: transaction.day, cents: running });
    running += transaction.cents;
    pushStep(steps, { x: transaction.day, cents: running });
  }
  pushStep(steps, { x: cursor, cents: running });

  const targetCents = toCents(goal.targetAmount);
  const plan =
    mode === 'monthly'
      ? buildMonthlyPlan(start, goal.targetDate, targetCents, span)
      : [{ x: 0, cents: targetCents }, { x: span, cents: targetCents }];
  const plannedCents = mode === 'monthly' ? centsAt(plan, cursor) : targetCents;

  return {
    start,
    end,
    span,
    goal: goal.targetAmount,
    mode,
    steps: steps.map((step) => ({ x: step.x, y: step.cents / 100 })),
    plan: plan.map((step) => ({ x: step.x, y: step.cents / 100 })),
    cursor,
    current: running / 100,
    planned: plannedCents / 100,
    gap: (plannedCents - running) / 100,
    savedBefore: beforeCents / 100,
  };
}
