import { Document, Types } from 'mongoose';
export type AccountDocument = Account & Document;
export declare class Account {
    id: number;
    name: string;
    holdings: number;
    holders: string[];
}
export declare const AccountSchema: import("mongoose").Schema<Account, import("mongoose").Model<Account, any, any, any, Document<unknown, any, Account, any, {}> & Account & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Account, Document<unknown, {}, import("mongoose").FlatRecord<Account>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Account> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
