import { SavingsGoal, VirtualTransaction } from '../models/savings';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad = (value: number): string => String(value).padStart(2, '0');

function parts(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
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

export interface AnalysisMonth {
  key: string;
  label: string;
  /** Sum of the virtual transactions dated in this calendar month. */
  added: number;
  /** Amount saved by the end of this month. */
  saved: number;
}

/** A point on the chart. `x` counts months from the start of the first month. */
export interface AnalysisPoint {
  x: number;
  y: number;
}

export interface MonthlyAnalysis {
  months: AnalysisMonth[];
  saved: AnalysisPoint[];
  pace: AnalysisPoint[];
  /** Saved before the first month of the chart (dated before the goal was created). */
  savedBefore: number;
}

function monthStart(first: string, offset: number): string {
  const { year, month } = parts(first);
  const index = year * 12 + (month - 1) + offset;
  const shifted = String(Math.floor(index / 12)).padStart(4, '0');
  return `${shifted}-${pad((index % 12) + 1)}-01`;
}

/**
 * Monthly analysis from the goal's creation month through the current month.
 * The pace line uses the target the goal had when it was created, so editing
 * the goal never moves it.
 */
export function buildMonthlyAnalysis(
  goal: Pick<
    SavingsGoal,
    'createdOn' | 'paceTargetAmount' | 'paceTargetDate'
  >,
  transactions: Pick<VirtualTransaction, 'amount' | 'date'>[],
  today: string
): MonthlyAnalysis {
  const first = monthStart(goal.createdOn, 0);
  const count = Math.max(monthsBetween(first, today), 0) + 1;

  const position = (iso: string, endOfDay = false): number => {
    const { year, month, day } = parts(iso);
    const offset = monthsBetween(first, iso);
    return offset + (day - (endOfDay ? 0 : 1)) / daysInMonth(year, month);
  };

  const addedCents = new Array<number>(count).fill(0);
  let beforeCents = 0;
  for (const transaction of transactions) {
    const offset = monthsBetween(first, transaction.date);
    if (offset < 0) beforeCents += toCents(transaction.amount);
    else addedCents[Math.min(offset, count - 1)] += toCents(transaction.amount);
  }

  let runningCents = beforeCents;
  const months: AnalysisMonth[] = [];
  for (let index = 0; index < count; index++) {
    runningCents += addedCents[index];
    const { year, month } = parts(monthStart(first, index));
    months.push({
      key: `${year}-${pad(month)}`,
      label: `${MONTH_NAMES[month - 1]} '${pad(year % 100)}`,
      added: addedCents[index] / 100,
      saved: runningCents / 100,
    });
  }

  const saved = months.map((month, index) => ({
    x:
      index === count - 1
        ? Math.min(position(today, true), count)
        : index + 1,
    y: month.saved,
  }));

  const total = daysBetween(goal.createdOn, goal.paceTargetDate);
  const pace: AnalysisPoint[] = [{ x: position(goal.createdOn), y: 0 }];
  if (total <= 0) {
    pace.push({ x: position(goal.createdOn), y: goal.paceTargetAmount });
  } else {
    for (let index = 0; index < count; index++) {
      const boundary = monthStart(first, index + 1);
      if (boundary >= goal.paceTargetDate) {
        pace.push({
          x: position(goal.paceTargetDate),
          y: goal.paceTargetAmount,
        });
        break;
      }
      const elapsed = daysBetween(goal.createdOn, boundary);
      pace.push({
        x: index + 1,
        y: (goal.paceTargetAmount * elapsed) / total,
      });
    }
  }

  return { months, saved, pace, savedBefore: beforeCents / 100 };
}
