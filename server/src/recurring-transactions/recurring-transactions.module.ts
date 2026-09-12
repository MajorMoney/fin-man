// src/recurring/recurring.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RecurringTransaction,
  RecurringTransactionSchema,
} from 'src/models/schemas/recurring-transaction.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/models/schemas/transactions.schema';
import { Account, AccountSchema } from 'src/models/schemas/account.schema';
import { User, UserSchema } from 'src/models/schemas/user.schema';
import { RecurringTransactionsProcessingService } from './services/recurring-transactions-processing.service';
import { RecurringTransactionsCron } from './recurring-transaction.cron';
import { RecurringStartupService } from './services/recurring-transaction-startup.service';
import { ValidationService } from 'src/validation/validation.service';
import { AccountHoldingsService } from 'src/accounts/accounts-holdings.service';
import { ValidationModule } from 'src/validation/validation.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './services/recurring-transaction.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { RecurringTransactionMediatorService } from './services/recurring-transaction-mediator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecurringTransaction.name, schema: RecurringTransactionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Account.name, schema: AccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ValidationModule,
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsProcessingService,
    RecurringTransactionsCron,
    RecurringStartupService,
    RecurringTransactionsService,
    RecurringTransactionMediatorService,
    ValidationService,
    AccountHoldingsService,
  ],
  exports: [
    RecurringTransactionsProcessingService,
    RecurringTransactionsService,
    RecurringTransactionsProcessingService,
    RecurringTransactionMediatorService
  ],
})
export class RecurringTransactionsModule {}
