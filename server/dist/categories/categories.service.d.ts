import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/models/schemas/category.schema';
import { CreateCategoryDto } from 'src/models/dto/category/create-category';
import { UpdateCategoryDto } from 'src/models/dto/category/update-category';
export declare class CategoriesService {
    private readonly categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    create(dto: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, CategoryDocument, {}, {}> & Category & Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<CategoryDocument[]>;
    findOne(id: number): Promise<CategoryDocument>;
    update(id: number, dto: UpdateCategoryDto): Promise<CategoryDocument>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
