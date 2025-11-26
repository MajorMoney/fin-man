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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const id_generator_1 = require("../utils/id-generator");
const expense_schema_1 = require("../models/schemas/expense.schema");
const user_schema_1 = require("../models/schemas/user.schema");
let ExpensesService = class ExpensesService {
    expenseModel;
    userModel;
    constructor(expenseModel, userModel) {
        this.expenseModel = expenseModel;
        this.userModel = userModel;
    }
    async create(dto) {
        const userExists = await this.userModel.findOne({ name: dto.user }).exec();
        if (!userExists) {
            throw new common_1.NotFoundException(`User ${dto.user} does not exist`);
        }
        const expense = new this.expenseModel({
            ...dto,
            id: (0, id_generator_1.generateId)(),
        });
        return expense.save();
    }
    async findAll() {
        return this.expenseModel.find().exec();
    }
    async findOne(id) {
        const expense = await this.expenseModel.findOne({ id }).exec();
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return expense;
    }
    async findByUser(user) {
        return this.expenseModel.find({ user }).exec();
    }
    async update(id, dto) {
        const expense = await this.expenseModel
            .findOneAndUpdate({ id }, dto, { new: true })
            .exec();
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return expense;
    }
    async remove(id) {
        const result = await this.expenseModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return { message: 'Expense deleted' };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map