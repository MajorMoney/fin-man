import { IncomeService } from './incomes.service';
import type { CreateIncomeDto } from 'src/models/dto/income/create-income';
import type { UpdateIncomeDto } from 'src/models/dto/income/update-income';
export declare class IncomeController {
    private readonly incomeService;
    constructor(incomeService: IncomeService);
    create(dto: CreateIncomeDto): Promise<import("mongoose").Document<unknown, {}, import("../models/schemas/income.scehma").IncomeDocument, {}, {}> & import("../models/schemas/income.scehma").Income & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<import("../models/schemas/income.scehma").IncomeDocument[]>;
    findOne(id: string): Promise<import("../models/schemas/income.scehma").IncomeDocument>;
    findByUser(user: string): Promise<import("../models/schemas/income.scehma").IncomeDocument[]>;
    update(id: string, dto: UpdateIncomeDto): Promise<import("../models/schemas/income.scehma").IncomeDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
