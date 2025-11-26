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
import { IncomeModule } from './incomes/incomes.module';
import { IncomeController } from './incomes/incomes.controller';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionsController } from './transactions/transactions.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/finman-db'),
    ExpensesModule,
    UsersModule,
    AccountsModule,
    IncomeModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [
    AppController,
    ExpensesController,
    UsersController,
    AccountsController,
    IncomeController,
    CategoriesController,
    TransactionsController,
  ],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
