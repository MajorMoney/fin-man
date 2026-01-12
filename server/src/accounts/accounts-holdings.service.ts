// src/services/account-holdings.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Account, AccountDocument } from 'src/models/schemas/account.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AccountHoldingsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {}

  /**
   * Update account holdings for a transaction.
   * Throws BadRequestException if insufficient funds.
   */
  async updateHoldings(
    accountName: string,
    type: 'income' | 'expense',
    amount: number,
  ): Promise<AccountDocument> {
    const account = await this.accountModel
      .findOne({ name: accountName })
      .exec();
    if (!account)
      throw new BadRequestException(`Account ${accountName} not found`);

    const newHoldings =
      type === 'income' ? account.holdings + amount : account.holdings - amount;

    if (newHoldings < 0) {
      throw new BadRequestException(
        `Insufficient funds in account ${accountName} for ${type} of ${amount}`,
      );
    }

    account.holdings = newHoldings;
    await account.save();

    return account;
  }

  /**
   * Adjust holdings for an updated transaction.
   * oldTx = previous transaction state
   * newTx = updated transaction state
   */
  async adjustHoldingsForUpdate(
    accountName: string,
    oldTx: { type: 'income' | 'expense'; amount: number },
    newTx: { type: 'income' | 'expense'; amount: number },
  ): Promise<AccountDocument> {
    const account = await this.accountModel
      .findOne({ name: accountName })
      .exec();
    if (!account)
      throw new NotFoundException(`Account ${accountName} not found`);

    const oldEffect = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
    const newEffect = newTx.type === 'income' ? newTx.amount : -newTx.amount;

    const delta = newEffect - oldEffect;
    const newHoldings = account.holdings + delta;

    if (newHoldings < 0) {
      throw new BadRequestException(
        'Insufficient funds in the account after update',
      );
    }

    account.holdings = newHoldings;
    await account.save();

    return account;
  }

  /**
   * Calculate the new holdings after applying a transaction object
   * Can be used for recurring transactions
   */
  calculateNewHoldings(
    account: AccountDocument,
    type: 'income' | 'expense',
    amount: number,
  ): number {
    const newHoldings =
      type === 'income' ? account.holdings + amount : account.holdings - amount;

    if (newHoldings < 0) {
      throw new BadRequestException(
        `Insufficient funds in account ${account.name}`,
      );
    }

    return newHoldings;
  }
}
