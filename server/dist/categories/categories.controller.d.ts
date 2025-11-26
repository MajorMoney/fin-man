import { CategoriesService } from './categories.service';
import type { CreateCategoryDto } from 'src/models/dto/category/create-category';
import type { UpdateCategoryDto } from 'src/models/dto/category/update-category';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(dto: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("../models/schemas/category.schema").CategoryDocument, {}, {}> & import("../models/schemas/category.schema").Category & Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<import("../models/schemas/category.schema").CategoryDocument[]>;
    findOne(id: string): Promise<import("../models/schemas/category.schema").CategoryDocument>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("../models/schemas/category.schema").CategoryDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
