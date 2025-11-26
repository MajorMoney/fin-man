import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import { CreateUserDto } from 'src/models/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/user/update-user.dto';
import { generateId } from '../utils/id-generator';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create({
      ...dto,
      id: generateId(),
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: number): Promise<UserDocument> {
    const user = await this.userModel.findOne({ id }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate({ id }, dto, { new: true }).exec();
  }

  async remove(id: number): Promise<UserDocument | null> {
    return this.userModel.findOneAndDelete({ id }).exec();
  }
}
