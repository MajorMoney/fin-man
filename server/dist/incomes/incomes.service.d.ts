import { Model } from 'mongoose';
import { Income, IncomeDocument } from 'src/models/schemas/income.scehma';
import { CreateIncomeDto } from 'src/models/dto/income/create-income';
import { UpdateIncomeDto } from 'src/models/dto/income/update-income';
import { UserDocument } from 'src/models/schemas/user.schema';
export declare class IncomeService {
    private readonly incomeModel;
    private readonly userModel;
    constructor(incomeModel: Model<IncomeDocument>, userModel: Model<UserDocument>);
    create(dto: CreateIncomeDto): Promise<import("mongoose").Document<unknown, {}, IncomeDocument, {}, {}> & Income & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<IncomeDocument[]>;
    findOne(id: number): Promise<IncomeDocument>;
    findByUser(user: string): Promise<IncomeDocument[]>;
    update(id: number, dto: UpdateIncomeDto): Promise<IncomeDocument>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
