import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../utils/id-generator';
import { Expense, ExpenseDocument } from 'src/models/schemas/expense.schema';
import { CreateExpenseDto } from 'src/models/dto/expense/create-expense.dto';
import { UpdateExpenseDto } from 'src/models/dto/expense/update-expense.dto';
import { User, UserDocument } from 'src/models/schemas/user.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateExpenseDto) {
    // Check if the user exists
    const userExists = await this.userModel.findOne({ name: dto.user }).exec();
    if (!userExists) {
      throw new NotFoundException(`User ${dto.user} does not exist`);
    }

    const expense = new this.expenseModel({
      ...dto,
      id: generateId(),
    });

    return expense.save();
  }

  async findAll(): Promise<ExpenseDocument[]> {
    return this.expenseModel.find().exec();
  }

  async findOne(id: number): Promise<ExpenseDocument> {
    const expense = await this.expenseModel.findOne({ id }).exec();
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async findByUser(user: string): Promise<ExpenseDocument[]> {
    return this.expenseModel.find({ user }).exec();
  }

  async update(id: number, dto: UpdateExpenseDto): Promise<ExpenseDocument> {
    const expense = await this.expenseModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.expenseModel.deleteOne({ id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Expense not found');
    }

    return { message: 'Expense deleted' };
  }
}
