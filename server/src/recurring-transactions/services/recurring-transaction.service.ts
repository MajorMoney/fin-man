import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RecurringTransaction,
  RecurringTransactionDocument,
} from 'src/models/schemas/recurring-transaction.schema';

import type { CreateRecurringTransactionDto } from 'src/models/dto/recurring-transactions/create-recurring-transaction';
import type { UpdateRecurringTransactionDto } from 'src/models/dto/recurring-transactions/update-recurring-transaction';

import { RecurringTransactionsProcessingService } from './recurring-transactions-processing.service';
import { generateId } from 'src/utils/id-generator';
import { ValidationService } from 'src/validation/validation.service';
import {
  Transaction,
  TransactionDocument,
} from 'src/models/schemas/transactions.schema';
import { RecurringTransactionMediatorService } from './recurring-transaction-mediator.service';
@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectModel(RecurringTransaction.name)
    private readonly recurringModel: Model<RecurringTransactionDocument>,
    private readonly validationService: ValidationService,
  ) { }

  // ───────────────────────────────
  // CREATE
  // ───────────────────────────────
  async create(
    dto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransactionDocument> {
    // Validate user, account, holder
    await this.validationService.validateUser(dto.user);
    await this.validationService.validateAccountByName(dto.account);
    await this.validationService.validateHolderByName(dto.user, dto.account);

    const created = new this.recurringModel({
      ...dto,
      id: generateId(),
    });
    return created.save();
  }

  // ───────────────────────────────
  // FIND ALL
  // ───────────────────────────────
  async findAll(): Promise<RecurringTransactionDocument[]> {
    return this.recurringModel.find().exec();
  }

  // ───────────────────────────────
  // FIND ONE
  // ───────────────────────────────
  async findOne(id: number): Promise<RecurringTransactionDocument> {
    const recur = await this.recurringModel.findOne({ id }).exec();
    if (!recur)
      throw new NotFoundException(`Recurring transaction ${id} not found`);
    return recur;
  }

  // ───────────────────────────────
  // FIND BY USER
  // ───────────────────────────────
  async findByUser(user: string): Promise<RecurringTransactionDocument[]> {
    return this.recurringModel.find({ user }).exec();
  }

  // ───────────────────────────────
  // FIND BY TYPE
  // ───────────────────────────────
  async findByType(
    type: 'income' | 'expense',
  ): Promise<RecurringTransactionDocument[]> {
    return this.recurringModel.find({ type }).exec();
  }

  // ───────────────────────────────
  // UPDATE
  // ───────────────────────────────
  async update(
    id: number,
    dto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransactionDocument> {
    // Validate user, account, holder
    if (dto.user) await this.validationService.validateUser(dto.user);
    if (dto.account) {
      await this.validationService.validateAccountByName(dto.account);
      if (dto.user)
        await this.validationService.validateHolderByName(
          dto.user,
          dto.account,
        );
    }

    console.log("Updating ",dto)
    const updated = await this.recurringModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`Recurring transaction ${id} not found`);

    return updated;
  }

  // ───────────────────────────────
  // DELETE
  // ───────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    // 1️⃣  Delete the recurring template
    const deleted = await this.recurringModel.deleteOne({ id }).exec();
    if (deleted.deletedCount === 0) {
      throw new NotFoundException(`Recurring transaction ${id} not found`);
    }

    return { message: 'Recurring transaction and all children deleted' };
  }
}
