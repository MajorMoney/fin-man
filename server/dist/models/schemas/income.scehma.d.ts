import { Document } from 'mongoose';
export type IncomeDocument = Income & Document;
export declare class Income {
    id: number;
    date: string;
    description: string;
    amount: number;
    currency?: string;
    account?: string;
    category: string;
    source?: string;
    recurring?: boolean;
    recurrenceRule?: string;
    notes?: string;
    user: string;
}
export declare const IncomeSchema: import("mongoose").Schema<Income, import("mongoose").Model<Income, any, any, any, Document<unknown, any, Income, any, {}> & Income & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Income, Document<unknown, {}, import("mongoose").FlatRecord<Income>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Income> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
