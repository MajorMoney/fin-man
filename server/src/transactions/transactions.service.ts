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

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {}

  async create(dto: CreateTransactionDto) {
    // 1️⃣ Check if user exists
    const userExists = await this.userModel.findOne({ name: dto.user }).exec();
    if (!userExists) {
      throw new NotFoundException(`User ${dto.user} does not exist`);
    }

    // 2️⃣ Ensure account is provided
    if (!dto.account) {
      throw new BadRequestException('Account is required for the transaction');
    }

    // 3️⃣ Check if account exists
    const account = await this.accountModel
      .findOne({ name: dto.account })
      .exec();
    if (!account) {
      throw new NotFoundException(`Account ${dto.account} does not exist`);
    }

    // 4️⃣ Check if user is a holder
    if (!account.holders.includes(dto.user)) {
      throw new BadRequestException(
        `User ${dto.user} is not a holder of account ${dto.account}`,
      );
    }

    // 5️⃣ Update account holdings
    let newHoldings = account.holdings;
    if (dto.type === 'income') {
      newHoldings += dto.amount; // increase for income
    } else if (dto.type === 'expense') {
      newHoldings -= dto.amount; // decrease for expense
    }

    account.holdings = newHoldings;
    await account.save();

    // 6️⃣ Create the transaction
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
    const user = await this.userModel.findOne({ name: updated.user }).exec();
    if (!user)
      throw new NotFoundException(`User ${updated.user} does not exist`);

    // 4️⃣ Validate account exists
    const account = await this.accountModel
      .findOne({ name: updated.account })
      .exec();
    if (!account)
      throw new NotFoundException(`Account ${updated.account} does not exist`);

    // 5️⃣ Validate user is a holder
    if (!account.holders.includes(updated.user)) {
      throw new BadRequestException(
        `User ${updated.user} is not a holder of account ${updated.account}`,
      );
    }

    // 6️⃣ Adjust holdings
    const delta =
      (updated.type === 'income' ? updated.amount : -updated.amount) -
      (existing.type === 'income' ? existing.amount : -existing.amount);

    const newHoldings = account.holdings + delta;
    if (newHoldings < 0) {
      throw new BadRequestException(
        'Insufficient funds in the account after update',
      );
    }

    account.holdings = newHoldings;
    await account.save();

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

    if (newHoldings < 0) {
      throw new BadRequestException(
        'Cannot delete transaction: insufficient funds after undoing',
      );
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
}
