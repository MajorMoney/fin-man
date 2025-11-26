"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const id_generator_1 = require("../utils/id-generator");
const transactions_schema_1 = require("../models/schemas/transactions.schema");
const user_schema_1 = require("../models/schemas/user.schema");
const account_schema_1 = require("../models/schemas/account.schema");
let TransactionsService = class TransactionsService {
    transactionModel;
    userModel;
    accountModel;
    constructor(transactionModel, userModel, accountModel) {
        this.transactionModel = transactionModel;
        this.userModel = userModel;
        this.accountModel = accountModel;
    }
    async create(dto) {
        const userExists = await this.userModel.findOne({ name: dto.user }).exec();
        if (!userExists) {
            throw new common_1.NotFoundException(`User ${dto.user} does not exist`);
        }
        if (!dto.account) {
            throw new common_1.BadRequestException('Account is required for the transaction');
        }
        const account = await this.accountModel
            .findOne({ name: dto.account })
            .exec();
        if (!account) {
            throw new common_1.NotFoundException(`Account ${dto.account} does not exist`);
        }
        if (!account.holders.includes(dto.user)) {
            throw new common_1.BadRequestException(`User ${dto.user} is not a holder of account ${dto.account}`);
        }
        let newHoldings = account.holdings;
        if (dto.type === 'income') {
            newHoldings += dto.amount;
        }
        else if (dto.type === 'expense') {
            newHoldings -= dto.amount;
        }
        account.holdings = newHoldings;
        await account.save();
        const transaction = new this.transactionModel({
            ...dto,
            id: (0, id_generator_1.generateId)(),
        });
        return transaction.save();
    }
    async findAll() {
        return this.transactionModel.find().exec();
    }
    async findOne(id) {
        const transaction = await this.transactionModel.findOne({ id }).exec();
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async findByUser(user) {
        return this.transactionModel.find({ user }).exec();
    }
    async update(id, dto) {
        const existing = await this.transactionModel.findOne({ id }).exec();
        if (!existing)
            throw new common_1.NotFoundException('Transaction not found');
        const updated = {
            user: dto.user ?? existing.user,
            account: dto.account ?? existing.account,
            type: dto.type ?? existing.type,
            amount: dto.amount ?? existing.amount,
        };
        if (!updated.account) {
            throw new common_1.BadRequestException('Account is required for the transaction');
        }
        const user = await this.userModel.findOne({ name: updated.user }).exec();
        if (!user)
            throw new common_1.NotFoundException(`User ${updated.user} does not exist`);
        const account = await this.accountModel
            .findOne({ name: updated.account })
            .exec();
        if (!account)
            throw new common_1.NotFoundException(`Account ${updated.account} does not exist`);
        if (!account.holders.includes(updated.user)) {
            throw new common_1.BadRequestException(`User ${updated.user} is not a holder of account ${updated.account}`);
        }
        const delta = (updated.type === 'income' ? updated.amount : -updated.amount) -
            (existing.type === 'income' ? existing.amount : -existing.amount);
        const newHoldings = account.holdings + delta;
        if (newHoldings < 0) {
            throw new common_1.BadRequestException('Insufficient funds in the account after update');
        }
        account.holdings = newHoldings;
        await account.save();
        const updatedTransaction = await this.transactionModel
            .findOneAndUpdate({ id }, dto, { new: true })
            .exec();
        if (!updatedTransaction)
            throw new common_1.NotFoundException('Failed to update transaction');
        return updatedTransaction;
    }
    async remove(id) {
        const result = await this.transactionModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return { message: 'Transaction deleted' };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transactions_schema_1.Transaction.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map