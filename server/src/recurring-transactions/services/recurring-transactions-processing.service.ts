import { Injectable, Logger } from '@nestjs/common';
import { RecurringTransactionDocument } from 'src/models/schemas/recurring-transaction.schema';
import { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import { generateId } from '../../utils/id-generator';

export interface ProcessRuleResult {
  recurringId: number;
  transactions: CreateTransactionDto[];
  nextDueDate: string;
}

@Injectable()
export class RecurringTransactionsProcessingService {
  private readonly logger = new Logger(
    RecurringTransactionsProcessingService.name,
  );

  async processRules(
    recurringTransactions: RecurringTransactionDocument[],
    upTo = new Date(),
  ): Promise<ProcessRuleResult[]> {
    const results: ProcessRuleResult[] = [];
    for (const recur of recurringTransactions) {
      results.push(await this.processRule(recur, upTo));
    }
    return results;
  }

  calculateNextDueDate(startDate: string, recurrenceRule: string): string {
    const next = this.step(new Date(startDate), recurrenceRule);
    return next.toISOString().split('T')[0];
  }

  async processRule(
    recur: RecurringTransactionDocument,
    upTo = new Date(),
  ): Promise<ProcessRuleResult> {
    console.debug('processing Recurring ', recur.description);

    const { occurrences, nextDueDate } = this.getOccurrences(recur, upTo);
    const transactions: CreateTransactionDto[] = [];
    console.log('Got ', occurrences.length, ' occurrences');

    for (const occ of occurrences) {
      console.debug('processing occurence', occ);
      transactions.push({
        id: generateId(),
        type: recur.type,
        date: occ.toISOString(),
        description: recur.description,
        amount: recur.amount,
        currency: recur.currency,
        account: recur.account,
        category: recur.category,
        notes: recur.notes,
        user: recur.user,
        parentRecurringId: recur.id as number,
        recurring: false,
      });
      console.log(
        'transaction pushed, transactions size = %d',
        transactions.length,
      );
    }

    return { recurringId: recur.id as number, transactions, nextDueDate };
  }

  private getOccurrences(
    recur: RecurringTransactionDocument,
    upTo: Date,
  ): { occurrences: Date[]; nextDueDate: string } {
    const end = recur.endDate ? new Date(recur.endDate) : null;
    let nextDueDate = new Date(
      recur.nextDueDate ??
        this.calculateNextDueDate(recur.startDate, recur.recurrenceRule),
    );
    console.log("Next due date : %s",nextDueDate)
    const occurrences: Date[] = [];

    upTo.setUTCHours(0, 0, 0, 0);

    while (nextDueDate < upTo) {
      console.debug('Cursor: %s , upTo: %s', nextDueDate, upTo);
      if (!end || nextDueDate <= end) {
        occurrences.push(new Date(nextDueDate));
      }
      nextDueDate = this.step(new Date(nextDueDate), recur.recurrenceRule);
      console.debug(
        'Cursor is now %s, after %s',
        nextDueDate,
        recur.recurrenceRule,
      );
    }

    return {
      occurrences,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
    };
  }

  private step(date: Date, frequency: string): Date {
    const d = new Date(date);
    switch (frequency.toUpperCase()) {
      case 'DAILY':
        d.setUTCDate(d.getUTCDate() + 1);
        break;
      case 'WEEKLY':
        d.setUTCDate(d.getUTCDate() + 7);
        break;
      case 'MONTHLY':
        d.setUTCMonth(d.getUTCMonth() + 1);
        break;
      default:
        d.setUTCFullYear(d.getUTCFullYear() + 1);
        break;
    }
    return d;
  }
}
