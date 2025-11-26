import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from 'src/models/schemas/transactions.schema';
import { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import { UpdateTransactionDto } from 'src/models/dto/transactions/update-transaction.dto';
import { UserDocument } from 'src/models/schemas/user.schema';
import { AccountDocument } from 'src/models/schemas/account.schema';
export declare class TransactionsService {
    private readonly transactionModel;
    private readonly userModel;
    private readonly accountModel;
    constructor(transactionModel: Model<TransactionDocument>, userModel: Model<UserDocument>, accountModel: Model<AccountDocument>);
    create(dto: CreateTransactionDto): Promise<import("mongoose").Document<unknown, {}, TransactionDocument, {}, {}> & Transaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<TransactionDocument[]>;
    findOne(id: number): Promise<TransactionDocument>;
    findByUser(user: string): Promise<TransactionDocument[]>;
    update(id: number, dto: UpdateTransactionDto): Promise<TransactionDocument>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
