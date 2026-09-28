import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/schemas/account.schema';
import { UsersModule } from 'src/users/users.module';
import { AccountHoldingsService } from './accounts-holdings.service';
import { AccountTransfersModule } from 'src/account-transfers/account-transfers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    UsersModule,
    AccountTransfersModule,
  ],
  providers: [AccountsService, AccountHoldingsService],
  controllers: [AccountsController],
  exports: [AccountsService, MongooseModule, AccountHoldingsService],
})
export class AccountsModule {}
