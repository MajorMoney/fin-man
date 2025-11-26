import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { IncomeService } from './incomes.service';
import type { CreateIncomeDto } from 'src/models/dto/income/create-income';
import type { UpdateIncomeDto } from 'src/models/dto/income/update-income';
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Body() dto: CreateIncomeDto) {
    return this.incomeService.create(dto);
  }

  @Get()
  findAll() {
    return this.incomeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeService.findOne(Number(id));
  }

  @Get('user/:user')
  findByUser(@Param('user') user: string) {
    return this.incomeService.findByUser(user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncomeDto) {
    return this.incomeService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeService.remove(Number(id));
  }
}
