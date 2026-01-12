import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/finman-db'),
    ExpensesModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    RecurringTransactionsModule,
    ValidationModule,
  ],
  controllers: [
    AppController,
    ExpensesController,
    UsersController,
    AccountsController,
    CategoriesController,
    TransactionsController,
    RecurringTransactionsController,
  ],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
