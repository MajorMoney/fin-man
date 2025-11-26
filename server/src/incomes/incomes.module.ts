import { Module } from '@nestjs/common';
import { IncomeController } from './incomes.controller';
import { IncomeService } from './incomes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from 'src/models/schemas/income.scehma';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    UsersModule,
  ],
  providers: [IncomeService],
  controllers: [IncomeController],
  exports: [IncomeService],
})
export class IncomeModule {}
