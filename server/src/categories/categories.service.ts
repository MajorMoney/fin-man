import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../utils/id-generator';
import { Category, CategoryDocument } from 'src/models/schemas/category.schema';
import { CreateCategoryDto } from 'src/models/dto/category/create-category';
import { UpdateCategoryDto } from 'src/models/dto/category/update-category';
@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = new this.categoryModel({
      ...dto,
      id: generateId(), // auto-generate ID like expenses
    });

    return category.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: number): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ id }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.categoryModel.deleteOne({ id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted' };
  }
}
