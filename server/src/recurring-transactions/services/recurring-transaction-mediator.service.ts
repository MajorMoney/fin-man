import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRecurringTransactionDto } from "src/models/dto/recurring-transactions/create-recurring-transaction";
import { UpdateRecurringTransactionDto } from "src/models/dto/recurring-transactions/update-recurring-transaction";
import { TransactionDocument } from "src/models/schemas/transactions.schema";
import { Transaction } from "typeorm";
import { RecurringTransactionsService } from "./recurring-transaction.service";
import { RecurringTransactionsProcessingService } from "./recurring-transactions-processing.service";
import { RecurringTransaction, RecurringTransactionDocument } from "src/models/schemas/recurring-transaction.schema";
import { TransactionsService } from "src/transactions/transactions.service";
import { CreateTransactionDto } from "src/models/dto/transactions/create-transaction.dto";

@Injectable()
export class RecurringTransactionMediatorService {
    constructor(
        private readonly recurringService: RecurringTransactionsService,
        private readonly processingService: RecurringTransactionsProcessingService,
        private readonly transactionService: TransactionsService

    ) { }

    /* ───────────────────────────────
       READS (pass-through)
       ─────────────────────────────── */

    findAll() {
        return this.recurringService.findAll();
    }

    findOne(id: number) {
        return this.recurringService.findOne(id);
    }

    findByUser(user: string) {
        return this.recurringService.findByUser(user);
    }

    findByType(type: 'income' | 'expense') {
        return this.recurringService.findByType(type);
    }

    /* ───────────────────────────────
       WRITES (orchestrated)
       ─────────────────────────────── */

    async create(dto: CreateRecurringTransactionDto) {
        const recur = await this.recurringService.create(dto);
        await this.persistGenerated(recur);
        return this.recurringService.findOne(recur.id);
    }

    async update(id: number, dto: UpdateRecurringTransactionDto) {
        const existing = await this.recurringService.findOne(id);
        dto.nextDueDate = dto.startDate ?? existing.startDate;

        const updated = await this.recurringService.update(id, dto);

        await this.transactionService.removeByParentRecurringId(id);

        await this.persistGenerated(updated);
        return this.recurringService.findOne(id);
    }

    async remove(id: number) {
        await this.transactionService.removeByParentRecurringId(id);

        return this.recurringService.remove(id);
    }

    /* ───────────────────────────────
       PROCESSING
       ─────────────────────────────── */

    async processAll(upTo = new Date()) {
        const rules = await this.recurringService.findAll();
        for (const rule of rules) {
            await this.persistGenerated(rule, upTo);
        }
    }

    private async persistGenerated(
        rule: RecurringTransactionDocument,
        upTo = new Date(),
    ) {
        const { transactions, nextDueDate } =
            await this.processingService.processRule(rule, upTo);

        for (const tx of transactions) {
            await this.transactionService.create(tx);
        }

        if (nextDueDate === rule.nextDueDate && transactions.length === 0) {
            return;
        }

        await this.recurringService.update(rule.id, { nextDueDate });
    }
}
