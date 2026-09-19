import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import type { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import type { UpdateTransactionDto } from 'src/models/dto/transactions/update-transaction.dto';
import type { QueryTransactionDto } from 'src/models/dto/transactions/query-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(Number(id));
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
