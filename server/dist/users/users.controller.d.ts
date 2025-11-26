import { UsersService } from './users.service';
import type { CreateUserDto } from 'src/models/dto/user/create-user.dto';
import type { UpdateUserDto } from 'src/models/dto/user/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<import("../models/schemas/user.schema").UserDocument>;
    findAll(): Promise<import("../models/schemas/user.schema").UserDocument[]>;
    findOne(id: string): Promise<import("../models/schemas/user.schema").UserDocument>;
    update(id: string, dto: UpdateUserDto): Promise<import("../models/schemas/user.schema").UserDocument | null>;
    remove(id: string): Promise<import("../models/schemas/user.schema").UserDocument | null>;
}
