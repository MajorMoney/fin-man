import { TransactionsService } from './transactions.service';
import type { CreateTransactionDto } from 'src/models/dto/transactions/create-transaction.dto';
import type { UpdateTransactionDto } from 'src/models/dto/transactions/update-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(dto: CreateTransactionDto): Promise<import("mongoose").Document<unknown, {}, import("../models/schemas/transactions.schema").TransactionDocument, {}, {}> & import("../models/schemas/transactions.schema").Transaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<import("../models/schemas/transactions.schema").TransactionDocument[]>;
    findOne(id: string): Promise<import("../models/schemas/transactions.schema").TransactionDocument>;
    findByUser(user: string): Promise<import("../models/schemas/transactions.schema").TransactionDocument[]>;
    update(id: string, dto: UpdateTransactionDto): Promise<import("../models/schemas/transactions.schema").TransactionDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
