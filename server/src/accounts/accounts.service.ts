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
import { User, UserDocument } from 'src/models/schemas/user.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.accountModel.deleteOne({ id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Account not found');
    }

    return { message: 'Account deleted' };
  }
}
