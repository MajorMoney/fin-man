import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SavingsGoal,
  SavingsGoalSchema,
} from 'src/models/schemas/savings-goal.schema';
import {
  VirtualTransaction,
  VirtualTransactionSchema,
} from 'src/models/schemas/virtual-transaction.schema';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavingsGoal.name, schema: SavingsGoalSchema },
      { name: VirtualTransaction.name, schema: VirtualTransactionSchema },
    ]),
  ],
  controllers: [SavingsController],
  providers: [SavingsService],
})
export class SavingsModule {}
