import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../utils/id-generator';
import { Income, IncomeDocument } from 'src/models/schemas/income.scehma';
import { CreateIncomeDto } from 'src/models/dto/income/create-income';
import { UpdateIncomeDto } from 'src/models/dto/income/update-income';
import { User, UserDocument } from 'src/models/schemas/user.schema';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private readonly incomeModel: Model<IncomeDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateIncomeDto) {
    // Check if the user exists
    const userExists = await this.userModel.findOne({ name: dto.user }).exec();
    if (!userExists) {
      throw new NotFoundException(`User ${dto.user} does not exist`);
    }

    const income = new this.incomeModel({
      ...dto,
      id: generateId(),
    });

    return income.save();
  }

  async findAll(): Promise<IncomeDocument[]> {
    return this.incomeModel.find().exec();
  }

  async findOne(id: number): Promise<IncomeDocument> {
    const income = await this.incomeModel.findOne({ id }).exec();
    if (!income) {
      throw new NotFoundException('Income not found');
    }
    return income;
  }

  async findByUser(user: string): Promise<IncomeDocument[]> {
    return this.incomeModel.find({ user }).exec();
  }

  async update(id: number, dto: UpdateIncomeDto): Promise<IncomeDocument> {
    const income = await this.incomeModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();

    if (!income) {
      throw new NotFoundException('Income not found');
    }

    return income;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.incomeModel.deleteOne({ id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Income not found');
    }

    return { message: 'Income deleted' };
  }
}
