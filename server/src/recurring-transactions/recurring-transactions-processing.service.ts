import { Injectable, Logger } from '@nestjs/common';
import { RecurringTransactionDocument } from 'src/models/schemas/recurring-transaction.schema';
import { TransactionsService } from 'src/transactions/transactions.service';
import { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import { generateId } from '../utils/id-generator';

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

@Injectable()
export class RecurringTransactionsProcessingService {
  private readonly logger = new Logger(
    RecurringTransactionsProcessingService.name,
  );

  constructor(private readonly transactionsService: TransactionsService) {}

  /* ------------------------------------------------------------ */
  /* Public API                                                    */
  /* ------------------------------------------------------------ */

  async processRules(
    recurringTransactions: RecurringTransactionDocument[],
    upTo = new Date(),
  ): Promise<{ processedRules: number; createdInstances: number }> {
    let processedRules = 0;
    let createdInstances = 0;

    for (const recur of recurringTransactions) {
      const created = await this.processRule(recur, upTo);
      if (created > 0) {
        processedRules++;
        createdInstances += created;
      }
    }

    return { processedRules, createdInstances };
  }

  async processRule(
    recur: RecurringTransactionDocument,
    upTo = new Date(),
  ): Promise<number> {
    const occurrences = this.getOccurrences(recur, upTo);
    let created = 0;

    for (const occ of occurrences) {
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

      try {
        await this.transactionsService.create(txDto);
        created++;
      } catch (err) {
        this.logger.error(
          `Failed creating transaction for recurring id=${recur.id} at ${occ.toISOString()}`,
          err as any,
        );
      }
    }

    return created;
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

    const from = lastProcessed ? new Date(lastProcessed.getTime() + 1) : start;

    const occurrences: Date[] = [];
    let cursor = new Date(start);

    while (cursor <= upTo) {
      if (cursor >= from && (!end || cursor <= end)) {
        occurrences.push(new Date(cursor));
      }

      cursor = this.step(cursor, recur.recurrenceRule);
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

    switch (frequency) {
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
