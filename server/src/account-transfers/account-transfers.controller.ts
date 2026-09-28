import { Controller, Get } from '@nestjs/common';
import { AccountTransfersService } from './account-transfers.service';

@Controller('account-transfers')
export class AccountTransfersController {
  constructor(
    private readonly accountTransfersService: AccountTransfersService,
  ) {}

  @Get()
  findAll() {
    return this.accountTransfersService.findAll();
  }
}
