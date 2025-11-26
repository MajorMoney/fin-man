import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import type { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import type { UpdateTransactionDto } from 'src/models/dto/transactions/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(Number(id));
  }

  @Get('user/:user')
  findByUser(@Param('user') user: string) {
    return this.transactionsService.findByUser(user);
  }

  @Get('type/:type')
  async getByType(
    @Param('type') type: 'income' | 'expense',
  ): Promise<TransactionDocument[]> {
    return this.transactionsService.findByType(type);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(Number(id));
  }
}
