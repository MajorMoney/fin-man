import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
} from 'src/models/dto/savings/savings-goal.dto';
import {
  CreateVirtualTransactionDto,
  UpdateVirtualTransactionDto,
} from 'src/models/dto/savings/virtual-transaction.dto';
import {
  SavingsGoal,
  SavingsGoalDocument,
} from 'src/models/schemas/savings-goal.schema';
import {
  VirtualTransaction,
  VirtualTransactionDocument,
} from 'src/models/schemas/virtual-transaction.schema';
import { generateId } from 'src/utils/id-generator';
import {
  assertAmount,
  assertDate,
  assertText,
  resolveToday,
  sumAmounts,
} from './savings.utils';

export interface SavingsGoalView {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  createdOn: string;
  paceTargetAmount: number;
  paceTargetDate: string;
  savedAmount: number;
  currency: 'EUR';
}

export interface VirtualTransactionView {
  id: number;
  goalId: number;
  amount: number;
  date: string;
  note: string;
}

const INITIAL_SAVINGS_NOTE = 'Already saved when the goal was created';

/**
 * Savings goals and their virtual transactions. Goals are not accounts, and
 * nothing here creates a real transaction or changes an account balance.
 */
@Injectable()
export class SavingsService {
  constructor(
    @InjectModel(SavingsGoal.name)
    private readonly goalModel: Model<SavingsGoalDocument>,
    @InjectModel(VirtualTransaction.name)
    private readonly transactionModel: Model<VirtualTransactionDocument>,
  ) {}

  async createGoal(dto: CreateSavingsGoalDto): Promise<SavingsGoalView> {
    const today = resolveToday(dto.today);
    const name = assertText(dto.name, 'Name', true);
    const description = assertText(dto.description, 'Description', false);
    const targetAmount = assertAmount(dto.targetAmount, 'Target amount');
    const targetDate = assertDate(dto.targetDate, 'Target date');
    if (targetDate < today) {
      throw new BadRequestException('Target date cannot be in the past');
    }
    const saved =
      dto.savedAmount == null || dto.savedAmount === 0
        ? null
        : this.assertSavedAmount(dto.savedAmount);

    const goal = await new this.goalModel({
      id: generateId(),
      name,
      description,
      targetAmount,
      targetDate,
      createdOn: today,
      paceTargetAmount: targetAmount,
      paceTargetDate: targetDate,
    }).save();

    if (saved != null) {
      try {
        await this.insertTransaction(
          goal.id,
          saved,
          today,
          INITIAL_SAVINGS_NOTE,
        );
      } catch (error) {
        await this.goalModel.deleteOne({ id: goal.id }).exec();
        throw error;
      }
    }

    return this.toGoalView(goal, saved ?? 0);
  }

  async findAllGoals(): Promise<SavingsGoalView[]> {
    const [goals, transactions] = await Promise.all([
      this.goalModel.find().sort({ targetDate: 1, id: 1 }).exec(),
      this.transactionModel.find().exec(),
    ]);
    const amounts = new Map<number, number[]>();
    for (const transaction of transactions) {
      const list = amounts.get(transaction.goalId) ?? [];
      list.push(transaction.amount);
      amounts.set(transaction.goalId, list);
    }
    return goals.map((goal) =>
      this.toGoalView(goal, sumAmounts(amounts.get(goal.id) ?? [])),
    );
  }

  async findGoal(id: number): Promise<SavingsGoalView> {
    const goal = await this.getGoal(id);
    return this.toGoalView(goal, await this.savedAmount(id));
  }

  async updateGoal(
    id: number,
    dto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoalView> {
    const goal = await this.getGoal(id);

    if (dto.name !== undefined) {
      goal.name = assertText(dto.name, 'Name', true);
    }
    if (dto.description !== undefined) {
      goal.description = assertText(dto.description, 'Description', false);
    }
    if (dto.targetAmount !== undefined) {
      goal.targetAmount = assertAmount(dto.targetAmount, 'Target amount');
    }
    if (dto.targetDate !== undefined) {
      const targetDate = assertDate(dto.targetDate, 'Target date');
      if (targetDate < goal.createdOn) {
        throw new BadRequestException(
          'Target date cannot be before the day the goal was created',
        );
      }
      goal.targetDate = targetDate;
    }

    // The pace line stays fixed: paceTargetAmount and paceTargetDate are never touched.
    await goal.save();
    return this.toGoalView(goal, await this.savedAmount(id));
  }

  async removeGoal(id: number): Promise<{ message: string }> {
    const result = await this.goalModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Savings goal not found');
    }
    // Goal first: if this fails the history is only orphaned, never a goal without history.
    await this.transactionModel.deleteMany({ goalId: id }).exec();
    return { message: 'Savings goal deleted' };
  }

  async findTransactions(goalId: number): Promise<VirtualTransactionView[]> {
    await this.getGoal(goalId);
    const transactions = await this.transactionModel
      .find({ goalId })
      .sort({ date: -1, id: -1 })
      .exec();
    return transactions.map((transaction) =>
      this.toTransactionView(transaction),
    );
  }

  async createTransaction(
    goalId: number,
    dto: CreateVirtualTransactionDto,
  ): Promise<VirtualTransactionView> {
    await this.getGoal(goalId);
    const today = resolveToday(dto.today);
    const amount = assertAmount(dto.amount, 'Amount');
    const date = this.assertNotFuture(dto.date, today);
    const note = assertText(dto.note, 'Note', false);
    return this.insertTransaction(goalId, amount, date, note);
  }

  async updateTransaction(
    goalId: number,
    id: number,
    dto: UpdateVirtualTransactionDto,
  ): Promise<VirtualTransactionView> {
    await this.getGoal(goalId);
    const transaction = await this.getTransaction(goalId, id);

    if (dto.amount !== undefined) {
      transaction.amount = assertAmount(dto.amount, 'Amount');
    }
    if (dto.date !== undefined) {
      transaction.date = this.assertNotFuture(
        dto.date,
        resolveToday(dto.today),
      );
    }
    if (dto.note !== undefined) {
      transaction.note = assertText(dto.note, 'Note', false);
    }

    await transaction.save();
    return this.toTransactionView(transaction);
  }

  async revertTransaction(
    goalId: number,
    id: number,
  ): Promise<{ message: string }> {
    await this.getGoal(goalId);
    const result = await this.transactionModel.deleteOne({ id, goalId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Virtual transaction not found');
    }
    return { message: 'Virtual transaction reverted' };
  }

  private async insertTransaction(
    goalId: number,
    amount: number,
    date: string,
    note: string,
  ): Promise<VirtualTransactionView> {
    const transaction = await new this.transactionModel({
      id: generateId(),
      goalId,
      amount,
      date,
      note,
    }).save();
    return this.toTransactionView(transaction);
  }

  private assertNotFuture(value: unknown, today: string): string {
    const date = assertDate(value, 'Date');
    if (date > today) {
      throw new BadRequestException('Date cannot be in the future');
    }
    return date;
  }

  private assertSavedAmount(value: unknown): number {
    if (typeof value === 'number' && value < 0) {
      throw new BadRequestException('Already saved cannot be negative');
    }
    return assertAmount(value, 'Already saved');
  }

  private async getGoal(id: number): Promise<SavingsGoalDocument> {
    const goal = await this.goalModel.findOne({ id }).exec();
    if (!goal) throw new NotFoundException('Savings goal not found');
    return goal;
  }

  private async getTransaction(
    goalId: number,
    id: number,
  ): Promise<VirtualTransactionDocument> {
    const transaction = await this.transactionModel
      .findOne({ id, goalId })
      .exec();
    if (!transaction) {
      throw new NotFoundException('Virtual transaction not found');
    }
    return transaction;
  }

  private async savedAmount(goalId: number): Promise<number> {
    const transactions = await this.transactionModel.find({ goalId }).exec();
    return sumAmounts(transactions.map((transaction) => transaction.amount));
  }

  private toGoalView(
    goal: SavingsGoalDocument,
    savedAmount: number,
  ): SavingsGoalView {
    return {
      id: goal.id,
      name: goal.name,
      description: goal.description ?? '',
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      createdOn: goal.createdOn,
      paceTargetAmount: goal.paceTargetAmount,
      paceTargetDate: goal.paceTargetDate,
      savedAmount,
      currency: 'EUR',
    };
  }

  private toTransactionView(
    transaction: VirtualTransactionDocument,
  ): VirtualTransactionView {
    return {
      id: transaction.id,
      goalId: transaction.goalId,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note ?? '',
    };
  }
}
