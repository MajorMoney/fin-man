import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from 'src/models/schemas/expense.schema';
import { CreateExpenseDto } from 'src/models/dto/expense/create-expense.dto';
import { UpdateExpenseDto } from 'src/models/dto/expense/update-expense.dto';
import { UserDocument } from 'src/models/schemas/user.schema';
export declare class ExpensesService {
    private readonly expenseModel;
    private readonly userModel;
    constructor(expenseModel: Model<ExpenseDocument>, userModel: Model<UserDocument>);
    create(dto: CreateExpenseDto): Promise<import("mongoose").Document<unknown, {}, ExpenseDocument, {}, {}> & Expense & Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<ExpenseDocument[]>;
    findOne(id: number): Promise<ExpenseDocument>;
    findByUser(user: string): Promise<ExpenseDocument[]>;
    update(id: number, dto: UpdateExpenseDto): Promise<ExpenseDocument>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
