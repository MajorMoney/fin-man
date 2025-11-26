import { ExpensesService } from './expenses.service';
import type { CreateExpenseDto } from 'src/models/dto/expense/create-expense.dto';
import type { UpdateExpenseDto } from 'src/models/dto/expense/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto): Promise<import("mongoose").Document<unknown, {}, import("../models/schemas/expense.schema").ExpenseDocument, {}, {}> & import("../models/schemas/expense.schema").Expense & Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<import("../models/schemas/expense.schema").ExpenseDocument[]>;
    findOne(id: string): Promise<import("../models/schemas/expense.schema").ExpenseDocument>;
    findByUser(user: string): Promise<import("../models/schemas/expense.schema").ExpenseDocument[]>;
    update(id: string, dto: UpdateExpenseDto): Promise<import("../models/schemas/expense.schema").ExpenseDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
