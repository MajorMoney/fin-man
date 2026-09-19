import { Module } from '@nestjs/common';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesController } from './expenses/expenses.controller';
import { UsersController } from './users/users.controller';
import { AccountsModule } from './accounts/accounts.module';
import { AccountsController } from './accounts/accounts.controller';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionsController } from './transactions/transactions.controller';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { ValidationModule } from './validation/validation.module';
import { RecurringTransactionsController } from './recurring-transactions/recurring-transactions.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/fin-man-dev'),
    ExpensesModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    RecurringTransactionsModule,
    ValidationModule,
  ],
  controllers: [
    ExpensesController,
    UsersController,
    AccountsController,
    CategoriesController,
    TransactionsController,
    RecurringTransactionsController,
  ],
  providers: [],
  exports: [],
})
export class AppModule { }
