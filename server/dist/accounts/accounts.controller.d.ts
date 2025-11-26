import { AccountsService } from './accounts.service';
import { type CreateAccountDto } from 'src/models/dto/account/create-account.dto';
import { type UpdateAccountDto } from 'src/models/dto/account/update-account.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(dto: CreateAccountDto): Promise<import("mongoose").Document<unknown, {}, import("../models/schemas/account.schema").AccountDocument, {}, {}> & import("../models/schemas/account.schema").Account & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<import("../models/schemas/account.schema").AccountDocument[]>;
    findOne(id: string): Promise<import("../models/schemas/account.schema").AccountDocument>;
    update(id: string, dto: UpdateAccountDto): Promise<import("../models/schemas/account.schema").AccountDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
