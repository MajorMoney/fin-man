// src/services/validation.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Account, AccountDocument } from 'src/models/schemas/account.schema';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import {
  RecurringTransaction,
  RecurringTransactionDocument,
} from 'src/models/schemas/recurring-transaction.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/models/schemas/transactions.schema';

@Injectable()
export class ValidationService {
  constructor(
    @InjectModel(RecurringTransaction.name)
    private readonly recurringModel: Model<RecurringTransactionDocument>,

    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,

    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  //
  // ───────────────────────────────────────────────────────────────
  // USER VALIDATION
  // ───────────────────────────────────────────────────────────────
  //

  /** Validate a user by name (session optional) */
  public async validateUserByName(
    userName: string,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const query = this.userModel.findOne({ name: userName });
    if (session) query.session(session);

    const user = await query.exec();
    if (!user) {
      throw new NotFoundException(`User ${userName} does not exist`);
    }

    return user;
  }

  /** Convenience: validate user from recurring transaction */
  public async validateUser(
    user: string,
    session?: ClientSession,
  ): Promise<UserDocument> {
    return this.validateUserByName(user, session);
  }

  //
  // ───────────────────────────────────────────────────────────────
  // ACCOUNT VALIDATION
  // ───────────────────────────────────────────────────────────────
  //

  /** Validate an account by name (session optional) */
  public async validateAccountByName(
    accountName: string,
    session?: ClientSession,
  ): Promise<AccountDocument> {
    const query = this.accountModel.findOne({ name: accountName });
    if (session) query.session(session);

    const account = await query.exec();
    if (!account) {
      throw new NotFoundException(`Account ${accountName} does not exist`);
    }

    return account;
  }

  //
  // ───────────────────────────────────────────────────────────────
  // HOLDER VALIDATION
  // ───────────────────────────────────────────────────────────────
  //

  /** Validate holder by name (session irrelevant) */
  public async validateHolderByName(
    userName: string,
    accountName: string,
    session?: ClientSession,
  ): Promise<void> {
    const query = this.accountModel.findOne({ name: accountName });
    if (session) query.session(session);

    const account = await query.exec();
    if (!account) {
      throw new NotFoundException(`Account ${accountName} does not exist`);
    }

    if (!account.holders.includes(userName)) {
      throw new BadRequestException(
        `User ${userName} is not a holder of account ${accountName}`,
      );
    }
  }
}
