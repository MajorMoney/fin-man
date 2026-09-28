import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountTransfer,
  AccountTransferSchema,
} from 'src/models/schemas/account-transfer.schema';
import { AccountTransfersController } from './account-transfers.controller';
import { AccountTransfersService } from './account-transfers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountTransfer.name, schema: AccountTransferSchema },
    ]),
  ],
  controllers: [AccountTransfersController],
  providers: [AccountTransfersService],
  exports: [AccountTransfersService],
})
export class AccountTransfersModule {}
