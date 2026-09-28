export type BudgetPeriod = 'monthly' | 'yearly';

export type BudgetIcon =
  | 'home'
  | 'cart'
  | 'car'
  | 'utensils'
  | 'heart'
  | 'film'
  | 'refresh'
  | 'shirt'
  | 'bag';

export interface BudgetTemplate {
  id: number;
  category: string | null;
  limit: number;
  icon: BudgetIcon;
  isOthers: boolean;
}

export interface BudgetSpending {
  type: string;
  category: string;
  amount: number;
  date: string;
}

export interface CategoryBudget {
  id: number;
  name: string;
  spent: number;
  limit: number;
  monthlyLimit: number;
  icon: BudgetIcon;
  isOthers: boolean;
}

export interface TransactionTemplate {
  id: number;
  title: string;
  category: string;
  account: string;
  holder: string;
  amount: number;
  kind: 'income' | 'expense';
  interval: string;
  icon: BudgetIcon;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  overBudget: CategoryBudget[];
}

export function budgetPercent(spent: number, limit: number): number {
  if (limit <= 0) return spent > 0 ? 100 : 0;
  return Math.round((spent / limit) * 100);
}

export function budgetBarColor(percent: number): string {
  if (percent > 100) return '#dc2626';
  if (percent === 100) return '#3b82f6';
  if (percent >= 90) return '#f59e0b';
  return '#22c55e';
}

export function summarizeBudgets(categories: CategoryBudget[]): BudgetSummary {
  const totalBudget = categories.reduce((sum, category) => sum + category.limit, 0);
  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    percentUsed: budgetPercent(totalSpent, totalBudget),
    overBudget: categories.filter((category) => category.spent > category.limit),
  };
}

export function deriveCategoryBudgets(
  templates: BudgetTemplate[],
  transactions: BudgetSpending[],
  period: BudgetPeriod,
  month: string
): CategoryBudget[] {
  const parts = budgetMonthParts(month);
  if (!parts) return [];

  const year = parts.year;
  const selectedMonth = period === 'yearly' ? null : parts.month;
  const limitFactor = period === 'yearly' ? 12 : 1;
  const expenses = transactions.filter(
    (transaction) =>
      transaction.type === 'expense' &&
      inBudgetPeriod(transaction.date, year, selectedMonth)
  );
  const named = templates.filter(
    (template) => !template.isOthers && template.category
  );
  const others = templates.find((template) => template.isOthers);
  const spentById = new Map<number, number>(
    named.map((template) => [template.id, 0])
  );
  let othersSpent = 0;

  for (const transaction of expenses) {
    const match = named.find((template) =>
      sameCategory(template.category ?? '', transaction.category)
    );
    if (match) {
      spentById.set(match.id, (spentById.get(match.id) ?? 0) + transaction.amount);
    } else {
      othersSpent += transaction.amount;
    }
  }

  const rows = named.map((template) =>
    toCategoryBudget(template, spentById.get(template.id) ?? 0, limitFactor)
  );
  if (others) rows.push(toCategoryBudget(others, othersSpent, limitFactor));
  return rows;
}

export function incomeInPeriod(
  transactions: BudgetSpending[],
  year: number,
  month: number | null
): number {
  return transactions.reduce((sum, transaction) => {
    if (transaction.type !== 'income') return sum;
    if (!inBudgetPeriod(transaction.date, year, month)) return sum;
    return sum + transaction.amount;
  }, 0);
}

export function budgetMonthParts(
  month: string
): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function toCategoryBudget(
  template: BudgetTemplate,
  spent: number,
  limitFactor: number
): CategoryBudget {
  return {
    id: template.id,
    name: template.isOthers ? 'Others' : template.category?.trim() || 'Others',
    spent,
    limit: template.limit * limitFactor,
    monthlyLimit: template.limit,
    icon: template.icon,
    isOthers: template.isOthers,
  };
}

function inBudgetPeriod(
  date: string,
  year: number,
  month: number | null
): boolean {
  const match = /^(\d{4})-(\d{2})/.exec(date);
  if (!match) return false;
  if (Number(match[1]) !== year) return false;
  if (month == null) return true;
  return Number(match[2]) === month;
}

function sameCategory(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
