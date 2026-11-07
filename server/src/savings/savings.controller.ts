import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import type {
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
} from 'src/models/dto/savings/savings-goal.dto';
import type {
  CreateVirtualTransactionDto,
  UpdateVirtualTransactionDto,
} from 'src/models/dto/savings/virtual-transaction.dto';

@Controller('savings-goals')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post()
  create(@Body() dto: CreateSavingsGoalDto) {
    return this.savingsService.createGoal(dto);
  }

  @Get()
  findAll() {
    return this.savingsService.findAllGoals();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savingsService.findGoal(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSavingsGoalDto) {
    return this.savingsService.updateGoal(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingsService.removeGoal(Number(id));
  }

  @Get(':id/virtual-transactions')
  findTransactions(@Param('id') id: string) {
    return this.savingsService.findTransactions(Number(id));
  }

  @Post(':id/virtual-transactions')
  createTransaction(
    @Param('id') id: string,
    @Body() dto: CreateVirtualTransactionDto,
  ) {
    return this.savingsService.createTransaction(Number(id), dto);
  }

  @Put(':id/virtual-transactions/:transactionId')
  updateTransaction(
    @Param('id') id: string,
    @Param('transactionId') transactionId: string,
    @Body() dto: UpdateVirtualTransactionDto,
  ) {
    return this.savingsService.updateTransaction(
      Number(id),
      Number(transactionId),
      dto,
    );
  }

  @Delete(':id/virtual-transactions/:transactionId')
  revertTransaction(
    @Param('id') id: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.savingsService.revertTransaction(
      Number(id),
      Number(transactionId),
    );
  }
}
