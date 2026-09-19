import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringTransactionMediatorService } from './services/recurring-transaction-mediator.service';

@Injectable()
export class RecurringTransactionsCron {
  private readonly logger = new Logger(RecurringTransactionsCron.name);

  constructor(
    private readonly recurringMediator: RecurringTransactionMediatorService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running recurring transactions cron job');
    try {
      await this.recurringMediator.processAll();
    } catch (err) {
      this.logger.error('Error processing recurring rules', err as any);
    }
  }
}
