import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { type CreateAccountDto } from 'src/models/dto/account/create-account.dto';
import { type UpdateAccountDto } from 'src/models/dto/account/update-account.dto';
import { type AccountTransferDto } from 'src/models/dto/account/account-transfer.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Post('transfer')
  transfer(@Body() dto: AccountTransferDto) {
    return this.accountsService.transfer(dto);
  }

  @Delete('transfer/:id/revert')
  revert(@Param('id') id: string) {
    return this.accountsService.revert(Number(id));
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(Number(id));
  }
}
