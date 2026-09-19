import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RecurringTransactionMediatorService } from './recurring-transaction-mediator.service';

@Injectable()
export class RecurringStartupService implements OnModuleInit {
  private readonly logger = new Logger(RecurringStartupService.name);

  constructor(
    private readonly recurringMediator: RecurringTransactionMediatorService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Running startup reconciliation for recurring transactions',
    );

    try {
      await this.recurringMediator.processAll();
    } catch (err) {
      this.logger.error('Startup reconciliation error', err as any);
    }
  }
}
