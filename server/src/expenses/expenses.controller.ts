import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import type { CreateExpenseDto } from 'src/models/dto/expense/create-expense.dto';
import type { UpdateExpenseDto } from 'src/models/dto/expense/update-expense.dto';
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(Number(id));
  }

  @Get('user/:user')
  findByUser(@Param('user') user: string) {
    return this.expensesService.findByUser(user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(Number(id));
  }
}
