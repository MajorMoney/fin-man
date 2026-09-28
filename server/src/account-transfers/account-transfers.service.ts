import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAccountTransferDto } from 'src/models/dto/account/create-account-transfer.dto';
import { generateId } from 'src/utils/id-generator';
import {
  AccountTransfer,
  AccountTransferDocument,
} from 'src/models/schemas/account-transfer.schema';

@Injectable()
export class AccountTransfersService {
  constructor(
    @InjectModel(AccountTransfer.name)
    private readonly accountTransferModel: Model<AccountTransferDocument>,
  ) {}

  async create(dto: CreateAccountTransferDto): Promise<AccountTransferDocument> {
    const accountTransfer = new this.accountTransferModel({
      ...dto,
      notes: dto.notes ?? '',
      id: generateId(),
    });
    return accountTransfer.save();
  }

  async findAll(): Promise<AccountTransferDocument[]> {
    return this.accountTransferModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: number): Promise<AccountTransferDocument> {
    const accountTransfer = await this.accountTransferModel.findOne({ id }).exec();
    if (!accountTransfer) {
      throw new NotFoundException('Account transfer not found');
    }
    return accountTransfer;
  }

  async remove(id: number): Promise<void> {
    const result = await this.accountTransferModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Account transfer not found');
    }
  }
}
