// src/recurring/recurring-startup.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RecurringTransactionsProcessingService } from './recurring-transactions-processing.service';
import { RecurringTransactionsService } from './recurring-transaction.service';
import { TransactionsService } from 'src/transactions/transactions.service';

@Injectable()
export class RecurringStartupService implements OnModuleInit {
  private readonly logger = new Logger(RecurringStartupService.name);

  constructor(
    private readonly recurringService: RecurringTransactionsService,
    private readonly recurringProcessingService: RecurringTransactionsProcessingService,
    private readonly transactionService: TransactionsService
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Running startup reconciliation for recurring transactions',
    );

    try {
      const allRules = await this.recurringService.findAll();
      await this.recurringProcessingService
        .processRules(allRules)
        .then((transactions) =>{ 
          for (const transaction of transactions) {
            this.transactionService.create(transaction);
            console.log("Created: ",transaction)
          }
        });
     for(const rule of allRules){
            const updated = await this.recurringService.update(rule.id,{lastProcessedAt:new Date().toISOString().split('T')[0]})
            console.debug("Updated Recurring transaction processed date: ",updated)
          }
    } catch (err) {
      this.logger.error('Startup reconciliation error', err as any);
    }
  }
}
