export type ExpenseDocument = Expense & Document;
export declare class Expense {
    id: number;
    date: string;
    description: string;
    amount: number;
    currency?: string;
    account?: string;
    category: string;
    notes?: string;
    user: string;
}
export declare const ExpenseSchema: import("mongoose").Schema<Expense, import("mongoose").Model<Expense, any, any, any, import("mongoose").Document<unknown, any, Expense, any, {}> & Expense & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Expense, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Expense>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Expense> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
