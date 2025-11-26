import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/models/schemas/account.schema';
import { CreateAccountDto } from 'src/models/dto/account/create-account.dto';
import { UpdateAccountDto } from 'src/models/dto/account/update-account.dto';
import { UserDocument } from 'src/models/schemas/user.schema';
export declare class AccountsService {
    private readonly accountModel;
    private readonly userModel;
    constructor(accountModel: Model<AccountDocument>, userModel: Model<UserDocument>);
    create(dto: CreateAccountDto): Promise<import("mongoose").Document<unknown, {}, AccountDocument, {}, {}> & Account & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<AccountDocument[]>;
    findOne(id: number): Promise<AccountDocument>;
    update(id: number, dto: UpdateAccountDto): Promise<AccountDocument>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
