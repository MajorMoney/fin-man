// src/recurring/recurring-transactions.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringTransactionsProcessingService } from './services/recurring-transactions-processing.service';
import { RecurringTransactionsService } from './services/recurring-transaction.service';

@Injectable()
export class RecurringTransactionsCron {
  private readonly logger = new Logger(RecurringTransactionsCron.name);

  constructor(
    private readonly recurringService: RecurringTransactionsService,
    private readonly rulesProcessingService: RecurringTransactionsProcessingService,
  ) {}

  // run every hour — change to CronExpression.EVERY_10_MINUTE or custom if you prefer more frequent
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running recurring transactions cron job');
    try {
      const allRules = await this.recurringService.findAll();
      await this.rulesProcessingService
        .processRules(allRules)
        .then((res) =>
          this.logger.log(
            `Processed ${allRules.length} recurring rules; created ${res.length} transactions`,
          ),
        );
    } catch (err) {
      this.logger.error('Error processing recurring rules', err as any);
    }
  }
}
