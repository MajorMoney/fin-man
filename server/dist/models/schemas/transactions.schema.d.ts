import { Document } from 'mongoose';
export type TransactionDocument = Transaction & Document;
export declare class Transaction {
    id: number;
    type: 'income' | 'expense';
    date: string;
    description: string;
    amount: number;
    currency: string;
    account: string;
    category: string;
    notes?: string;
    user: string;
    recurring?: boolean;
    recurrenceRule?: string;
    endDate?: string;
}
export declare const TransactionSchema: import("mongoose").Schema<Transaction, import("mongoose").Model<Transaction, any, any, any, Document<unknown, any, Transaction, any, {}> & Transaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, Document<unknown, {}, import("mongoose").FlatRecord<Transaction>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Transaction> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
