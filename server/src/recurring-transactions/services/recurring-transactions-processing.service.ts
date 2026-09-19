import { Injectable, Logger } from '@nestjs/common';
import { RecurringTransactionDocument } from 'src/models/schemas/recurring-transaction.schema';
import { TransactionsService } from 'src/transactions/transactions.service';
import { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import { generateId } from '../../utils/id-generator';
import { StringUtils } from 'src/utils/string.utils';
import { RecurringTransactionsService } from './recurring-transaction.service';
import { RecurringTransactionMediatorService } from './recurring-transaction-mediator.service';
import en from 'zod/v4/locales/en.js';

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

@Injectable()
export class RecurringTransactionsProcessingService {
  private readonly logger = new Logger(
    RecurringTransactionsProcessingService.name,
  );


  /* ------------------------------------------------------------ */
  /* Public API                                                    */
  /* ------------------------------------------------------------ */

  async processRules(
    recurringTransactions: RecurringTransactionDocument[],
    upTo = new Date(),
  ): Promise<CreateTransactionDto[]> {
    let processedRules = 0;
    let createdInstances = 0;
    let transactions: CreateTransactionDto[] = [];

    for (const recur of recurringTransactions) {
      const newTransactions = await this.processRule(recur, upTo);
      transactions.push(...newTransactions);
    }
    return transactions;
  }

  async processRule(
    recur: RecurringTransactionDocument,
    upTo = new Date(),
  ): Promise<CreateTransactionDto[]> {
    console.debug("processing Recurring ",recur.description)

    const occurrences = this.getOccurrences(recur, upTo);
    let created = 0;
    let transactions: CreateTransactionDto[] = [];
      console.log("Got ",occurrences.length, " occurrences")

    for (const occ of occurrences) {
      console.debug("processing occurence",occ)

      if (recur.lastProcessedAt && StringUtils.parseDate(recur.lastProcessedAt) >= occ) {
        console.debug("last processed at %s >= occ date %s will not process",new Date(recur.lastProcessedAt),occ)
        continue;
      }
      const txDto: CreateTransactionDto = {
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
      };

      transactions.push(txDto);
      console.log("transaction pushed, transactions size = %d",transactions.length)
    }

    return transactions;
  }

  /* ------------------------------------------------------------ */
  /* Core recurrence logic                                        */
  /* ------------------------------------------------------------ */

  private getOccurrences(
    recur: RecurringTransactionDocument,
    upTo: Date,
  ): Date[] {
    const start = new Date(recur.startDate);
    const end = recur.endDate ? new Date(recur.endDate) : null;
    const lastProcessed = recur.lastProcessedAt
      ? new Date(recur.lastProcessedAt)
      : null;

    console.debug("start: %s end: %s lastProcessed: %s",new Date(start),end?new Date(end):null,lastProcessed?new Date(lastProcessed):null)

    let from = lastProcessed ? new Date(lastProcessed.getTime() + 1) : start;

    console.debug("From: %s",from)
    const occurrences: Date[] = [];

    upTo.setUTCHours(0, 0, 0, 0);
    
    while (from < upTo) {
      console.debug("Cursor: %s , upTo: %s",from,upTo)
      if (!end || from <= end) {
        occurrences.push(new Date(from));
      }
      from = this.step(new Date(from), recur.recurrenceRule);
      console.debug("Cursor is now %s, after %s",from,recur.recurrenceRule)

    }

    return occurrences;
  }
  /* ------------------------------------------------------------ */
  /* Date stepping                                                */
  /* ------------------------------------------------------------ */

  private advance(date: Date, frequency: string, interval: number): Date {
    const d = new Date(date);

    switch (frequency) {
      case 'DAILY':
        d.setUTCDate(d.getUTCDate() + interval);
        break;

      case 'WEEKLY':
        d.setUTCDate(d.getUTCDate() + 7 * interval);
        break;

      case 'MONTHLY': {
        const day = d.getUTCDate();
        d.setUTCMonth(d.getUTCMonth() + interval);

        // Skip invalid dates (e.g. Feb 30)
        if (d.getUTCDate() !== day) {
          return this.advance(d, 'MONTHLY', 1);
        }
        break;
      }

      case 'YEARLY': {
        const day = d.getUTCDate();
        const month = d.getUTCMonth();
        d.setUTCFullYear(d.getUTCFullYear() + interval);

        // Skip invalid dates (Feb 29 on non-leap years)
        if (d.getUTCDate() !== day || d.getUTCMonth() !== month) {
          return this.advance(d, 'YEARLY', 1);
        }
        break;
      }

      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }

    return d;
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
