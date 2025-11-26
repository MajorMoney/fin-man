import { Model } from 'mongoose';
import { UserDocument } from 'src/models/schemas/user.schema';
import { CreateUserDto } from 'src/models/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/user/update-user.dto';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    create(dto: CreateUserDto): Promise<UserDocument>;
    findAll(): Promise<UserDocument[]>;
    findOne(id: number): Promise<UserDocument>;
    update(id: number, dto: UpdateUserDto): Promise<UserDocument | null>;
    remove(id: number): Promise<UserDocument | null>;
}
