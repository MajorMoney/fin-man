import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../utils/id-generator';
import {
  Transaction,
  TransactionDocument,
} from 'src/models/schemas/transactions.schema';
import { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import { UpdateTransactionDto } from 'src/models/dto/transactions/update-transaction.dto';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import { Account, AccountDocument } from 'src/models/schemas/account.schema';
import { AccountHoldingsService } from 'src/accounts/accounts-holdings.service';
import { ValidationService } from 'src/validation/validation.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    private readonly accountHoldingsService: AccountHoldingsService,
    private readonly validationService: ValidationService,
  ) { }

  async create(dto: CreateTransactionDto) {
    // 1 Validate user exists
    await this.validationService.validateUser(dto.user);
    // 2 Validate account exists
    await this.validationService.validateAccountByName(dto.account);

    // 3 Validate user is a holder
    await this.validationService.validateHolderByName(dto.user, dto.account);

    // 4 Update account holdings
    await this.accountHoldingsService.updateHoldings(
      dto.account,
      dto.type,
      dto.amount,
    );

    // 5 Create the transaction
    const transaction = new this.transactionModel({
      ...dto,
      id: generateId(),
    });

    return transaction.save();
  }

  async findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel.find().exec();
  }

  async findOne(id: number): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findOne({ id }).exec();
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async findByUser(user: string): Promise<TransactionDocument[]> {
    return this.transactionModel.find({ user }).exec();
  }

  async findByType(type: 'income' | 'expense'): Promise<TransactionDocument[]> {
    return this.transactionModel.find({ type }).exec();
  }

  async update(
    id: number,
    dto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    // 1️⃣ Fetch existing transaction
    const existing = await this.transactionModel.findOne({ id }).exec();
    if (!existing) throw new NotFoundException('Transaction not found');

    // 2️⃣ Determine updated values (use old values if not provided)
    const updated = {
      user: dto.user ?? existing.user,
      account: dto.account ?? existing.account,
      type: dto.type ?? existing.type,
      amount: dto.amount ?? existing.amount,
    };

    if (!updated.account) {
      throw new BadRequestException('Account is required for the transaction');
    }

    // 3️⃣ Validate user exists
    await this.validationService.validateUser(updated.user);
    // 4️⃣ Validate account exists
    const account = await this.validationService.validateAccountByName(
      updated.account,
    );

    // 5️⃣ Validate user is a holder
    await this.validationService.validateHolderByName(
      updated.user,
      updated.account,
    );

    // 6️⃣ Adjust holdings
    await this.accountHoldingsService.adjustHoldingsForUpdate(
      account.name,
      existing,
      updated,
    );
    // 7️⃣ Update transaction
    const updatedTransaction = await this.transactionModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();

    if (!updatedTransaction)
      throw new NotFoundException('Failed to update transaction');

    return updatedTransaction;
  }

  async remove(id: number): Promise<{ message: string }> {
    // 1️⃣ Find the existing transaction
    const existing = await this.transactionModel.findOne({ id }).exec();
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    // 2️⃣ Find the related account
    const account = await this.accountModel
      .findOne({ name: existing.account })
      .exec();
    if (!account) {
      throw new NotFoundException(`Account ${existing.account} not found`);
    }

    // 3️⃣ Reverse the transaction's effect on holdings
    let newHoldings = account.holdings;
    if (existing.type === 'income') {
      newHoldings -= existing.amount;
    } else if (existing.type === 'expense') {
      newHoldings += existing.amount;
    }

    account.holdings = newHoldings;
    await account.save();

    // 4️⃣ Delete the transaction
    const result = await this.transactionModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Failed to delete transaction');
    }

    return { message: 'Transaction deleted' };
  }

  async removeByParentRecurringId(
    parentRecurringId: number,
  ): Promise<{ deleted: number }> {
    // 1️⃣ Find all child transactions
    const transactions = await this.transactionModel
      .find({ parentRecurringId })
      .exec();

    if (transactions.length === 0) {
      return { deleted: 0 };
    }

    // 2️⃣ Reverse holdings for each transaction
    for (const tx of transactions) {
      const account = await this.accountModel
        .findOne({ name: tx.account })
        .exec();

      if (!account) {
        throw new NotFoundException(`Account ${tx.account} not found`);
      }

      if (tx.type === 'income') {
        account.holdings -= tx.amount;
      } else {
        account.holdings += tx.amount;
      }

      await account.save();
    }

    // 3️⃣ Delete all child transactions
    const result = await this.transactionModel
      .deleteMany({ parentRecurringId })
      .exec();

    return { deleted: result.deletedCount ?? 0 };
  }
}
