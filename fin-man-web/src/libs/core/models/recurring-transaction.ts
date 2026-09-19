import { Transaction } from './transactions';

export type TransactionType = 'income' | 'expense';

export interface RecurringTransaction extends Transaction {
  /** Recurrence */
  startDate: string; // ISO date
  recurrenceRule: string; // RRULE string
  endDate?: string; // optional stop date

  /** System fields (managed by backend) */
  nextDueDate?: string; // next occurrence to generate
}
