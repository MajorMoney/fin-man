import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/schemas/account.schema';
import {
  RecurringTransaction,
  RecurringTransactionSchema,
} from 'src/models/schemas/recurring-transaction.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/models/schemas/transactions.schema';
import { User, UserSchema } from 'src/models/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecurringTransaction.name, schema: RecurringTransactionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Account.name, schema: AccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}
