import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { RecurringTransactionsService } from './services/recurring-transaction.service';

import type { CreateRecurringTransactionDto } from 'src/models/dto/recurring-transactions/create-recurring-transaction';
import type { UpdateRecurringTransactionDto } from 'src/models/dto/recurring-transactions/update-recurring-transaction';
import { RecurringTransactionDocument } from 'src/models/schemas/recurring-transaction.schema';
import { RecurringTransactionMediatorService } from './services/recurring-transaction-mediator.service';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringService: RecurringTransactionMediatorService,
  ) {}

  // ───────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────
  @Post()
  create(@Body() dto: CreateRecurringTransactionDto) {
    return this.recurringService.create(dto);
  }

  // ───────────────────────────────────────────
  // GET ALL
  // ───────────────────────────────────────────
  @Get()
  findAll() {
    return this.recurringService.findAll();
  }

  // ───────────────────────────────────────────
  // GET ONE
  // ───────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recurringService.findOne(Number(id));
  }

  // ───────────────────────────────────────────
  // GET BY USER
  // ───────────────────────────────────────────
  @Get('user/:user')
  findByUser(@Param('user') user: string) {
    return this.recurringService.findByUser(user);
  }

  // ───────────────────────────────────────────
  // GET BY TYPE
  // ───────────────────────────────────────────
  @Get('type/:type')
  findByType(
    @Param('type') type: 'income' | 'expense',
  ): Promise<RecurringTransactionDocument[]> {
    return this.recurringService.findByType(type);
  }

  // ───────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecurringTransactionDto) {
    return this.recurringService.update(Number(id), dto);
  }

  // ───────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recurringService.remove(Number(id));
  }
}
