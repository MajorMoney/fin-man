import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/schemas/account.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    UsersModule,
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService, MongooseModule],
})
export class AccountsModule {}
