"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const expenses_module_1 = require("./expenses/expenses.module");
const users_module_1 = require("./users/users.module");
const mongoose_1 = require("@nestjs/mongoose");
const expenses_controller_1 = require("./expenses/expenses.controller");
const users_controller_1 = require("./users/users.controller");
const accounts_module_1 = require("./accounts/accounts.module");
const accounts_controller_1 = require("./accounts/accounts.controller");
const incomes_module_1 = require("./incomes/incomes.module");
const incomes_controller_1 = require("./incomes/incomes.controller");
const categories_controller_1 = require("./categories/categories.controller");
const categories_module_1 = require("./categories/categories.module");
const transactions_module_1 = require("./transactions/transactions.module");
const transactions_controller_1 = require("./transactions/transactions.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/finman-db'),
            expenses_module_1.ExpensesModule,
            users_module_1.UsersModule,
            accounts_module_1.AccountsModule,
            incomes_module_1.IncomeModule,
            categories_module_1.CategoriesModule,
            transactions_module_1.TransactionsModule,
        ],
        controllers: [
            app_controller_1.AppController,
            expenses_controller_1.ExpensesController,
            users_controller_1.UsersController,
            accounts_controller_1.AccountsController,
            incomes_controller_1.IncomeController,
            categories_controller_1.CategoriesController,
            transactions_controller_1.TransactionsController,
        ],
        providers: [app_service_1.AppService],
        exports: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map