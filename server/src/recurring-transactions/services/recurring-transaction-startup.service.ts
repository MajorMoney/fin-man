// src/recurring/recurring-startup.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RecurringTransactionsProcessingService } from './recurring-transactions-processing.service';
import { RecurringTransactionsService } from './recurring-transaction.service';

@Injectable()
export class RecurringStartupService implements OnModuleInit {
  private readonly logger = new Logger(RecurringStartupService.name);

  constructor(
    private readonly recurringService: RecurringTransactionsService,
    private readonly recurringProcessingService: RecurringTransactionsProcessingService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Running startup reconciliation for recurring transactions',
    );

    try {
      const allRules = await this.recurringService.findAll();
      await this.recurringProcessingService
        .processRules(allRules)
        .then((res) =>
          this.logger.log(
            `Startup: processed ${allRules.length} rules, created ${res.length} transactions`,
          ),
        );
    } catch (err) {
      this.logger.error('Startup reconciliation error', err as any);
    }
  }
}
