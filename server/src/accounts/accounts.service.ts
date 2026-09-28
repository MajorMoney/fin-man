import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../utils/id-generator';
import { Account, AccountDocument } from 'src/models/schemas/account.schema';
import { CreateAccountDto } from 'src/models/dto/account/create-account.dto';
import { UpdateAccountDto } from 'src/models/dto/account/update-account.dto';
import { AccountTransferDto } from 'src/models/dto/account/account-transfer.dto';
import { AccountTransfersService } from 'src/account-transfers/account-transfers.service';
import { User, UserDocument } from 'src/models/schemas/user.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly accountTransfersService: AccountTransfersService,
  ) {}

  async create(dto: CreateAccountDto) {
    if (!dto.holders || dto.holders.length === 0) {
      throw new BadRequestException('Account must have at least one holder');
    }
    const uniqueHolders = [...new Set(dto.holders)];
    // Validate that all holders exist
    for (const holder of uniqueHolders) {
      const userExists = await this.userModel.findOne({ name: holder }).exec();
      if (!userExists) {
        throw new NotFoundException(`User ${holder} does not exist`);
      }
    }

    const account = new this.accountModel({
      ...dto,
      holders: uniqueHolders,
      id: generateId(),
    });

    return account.save();
  }

  async findAll(): Promise<AccountDocument[]> {
    return this.accountModel.find().exec();
  }

  async findOne(id: number): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({ id }).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(id: number, dto: UpdateAccountDto): Promise<AccountDocument> {
    // If holders are being updated, validate they exist
    if (dto.holders && dto.holders.length === 0) {
      throw new BadRequestException('Account must have at least one holder');
    }
    const uniqueHolders = [...new Set(dto.holders)];

    for (const holder of uniqueHolders) {
      const userExists = await this.userModel.findOne({ name: holder }).exec();
      if (!userExists) {
        throw new NotFoundException(`User ${holder} does not exist`);
      }
    }

    const account = await this.accountModel
      .findOneAndUpdate(
        { id },
        { ...dto, holders: uniqueHolders },
        { new: true },
      )
      .exec();

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async transfer(dto: AccountTransferDto) {
    this.assertAccountTransfer(dto);
    const { source, destination } = await this.moveHoldings(
      dto.fromAccountId,
      dto.toAccountId,
      dto.amount,
    );

    try {
      return await this.accountTransfersService.create({
        fromAccountId: source.id,
        toAccountId: destination.id,
        fromAccount: source.name,
        toAccount: destination.name,
        amount: dto.amount,
        date: dto.date,
        notes: dto.notes ?? '',
        currency: 'EUR',
      });
    } catch (error) {
      await this.moveHoldings(destination.id, source.id, dto.amount);
      throw error;
    }
  }

  async revert(id: number) {
    const accountTransfer = await this.accountTransfersService.findOne(id);
    await this.moveHoldings(
      accountTransfer.toAccountId,
      accountTransfer.fromAccountId,
      accountTransfer.amount,
    );

    try {
      await this.accountTransfersService.remove(id);
    } catch (error) {
      await this.moveHoldings(
        accountTransfer.fromAccountId,
        accountTransfer.toAccountId,
        accountTransfer.amount,
      );
      throw error;
    }
  }

  private assertAccountTransfer(dto: AccountTransferDto): void {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Choose two different accounts');
    }
    if (!dto.date) {
      throw new BadRequestException('Date is required');
    }
    this.assertAmount(dto.amount);
  }

  private assertAmount(amount: number): void {
    if (!(amount > 0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    if (!/^\d+(\.\d{1,2})?$/.test(String(amount))) {
      throw new BadRequestException(
        'Amount cannot have more than 2 decimal places',
      );
    }
  }

  private async moveHoldings(
    sourceId: number,
    destinationId: number,
    amount: number,
  ): Promise<{ source: AccountDocument; destination: AccountDocument }> {
    this.assertAmount(amount);
    const source = await this.findOne(sourceId);
    const destination = await this.findOne(destinationId);

    if (source.holdings < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    source.holdings -= amount;
    await source.save();

    try {
      destination.holdings += amount;
      await destination.save();
    } catch (error) {
      source.holdings += amount;
      await source.save();
      throw error;
    }

    return { source, destination };
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.accountModel.deleteOne({ id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Account not found');
    }

    return { message: 'Account deleted' };
  }
}
