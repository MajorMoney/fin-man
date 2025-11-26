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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const id_generator_1 = require("../utils/id-generator");
const account_schema_1 = require("../models/schemas/account.schema");
const user_schema_1 = require("../models/schemas/user.schema");
let AccountsService = class AccountsService {
    accountModel;
    userModel;
    constructor(accountModel, userModel) {
        this.accountModel = accountModel;
        this.userModel = userModel;
    }
    async create(dto) {
        if (!dto.holders || dto.holders.length === 0) {
            throw new common_1.BadRequestException('Account must have at least one holder');
        }
        const uniqueHolders = [...new Set(dto.holders)];
        for (const holder of uniqueHolders) {
            const userExists = await this.userModel.findOne({ name: holder }).exec();
            if (!userExists) {
                throw new common_1.NotFoundException(`User ${holder} does not exist`);
            }
        }
        const account = new this.accountModel({
            ...dto,
            holders: uniqueHolders,
            id: (0, id_generator_1.generateId)(),
        });
        return account.save();
    }
    async findAll() {
        return this.accountModel.find().exec();
    }
    async findOne(id) {
        const account = await this.accountModel.findOne({ id }).exec();
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async update(id, dto) {
        if (dto.holders && dto.holders.length === 0) {
            throw new common_1.BadRequestException('Account must have at least one holder');
        }
        const uniqueHolders = [...new Set(dto.holders)];
        for (const holder of uniqueHolders) {
            const userExists = await this.userModel.findOne({ name: holder }).exec();
            if (!userExists) {
                throw new common_1.NotFoundException(`User ${holder} does not exist`);
            }
        }
        const account = await this.accountModel
            .findOneAndUpdate({ id }, { ...dto, holders: uniqueHolders }, { new: true })
            .exec();
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async remove(id) {
        const result = await this.accountModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Account not found');
        }
        return { message: 'Account deleted' };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map