import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBudgetDto } from 'src/models/dto/budget/create-budget.dto';
import { UpdateBudgetDto } from 'src/models/dto/budget/update-budget.dto';
import {
  BUDGET_ICONS,
  Budget,
  BudgetDocument,
  BudgetIconName,
} from 'src/models/schemas/budget.schema';
import { generateId } from 'src/utils/id-generator';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name)
    private readonly budgetModel: Model<BudgetDocument>,
  ) {}

  async create(dto: CreateBudgetDto): Promise<BudgetDocument> {
    if (dto.isOthers) {
      throw new BadRequestException('The Others budget cannot be created');
    }

    const category = this.assertCategory(dto.category);
    await this.assertUniqueCategory(category);
    return new this.budgetModel({
      id: generateId(),
      category,
      limit: this.assertLimit(dto.limit, false),
      icon: this.assertIcon(dto.icon),
      isOthers: false,
    }).save();
  }

  async findAll(): Promise<BudgetDocument[]> {
    await this.ensureOthers();
    return this.budgetModel.find().sort({ isOthers: 1, category: 1 }).exec();
  }

  async findOne(id: number): Promise<BudgetDocument> {
    const budget = await this.budgetModel.findOne({ id }).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: number, dto: UpdateBudgetDto): Promise<BudgetDocument> {
    const budget = await this.findOne(id);
    if (budget.isOthers) {
      if (dto.category != null || dto.icon != null) {
        throw new BadRequestException('Only the Others limit can be changed');
      }
      if (dto.limit == null) {
        throw new BadRequestException('Limit is required');
      }
      budget.limit = this.assertLimit(dto.limit, true);
      return budget.save();
    }

    if (dto.limit != null) {
      budget.limit = this.assertLimit(dto.limit, false);
    }
    if (dto.icon != null) {
      budget.icon = this.assertIcon(dto.icon);
    }
    if (dto.category != null) {
      const category = this.assertCategory(dto.category);
      await this.assertUniqueCategory(category, budget.id);
      budget.category = category;
    }
    return budget.save();
  }

  async remove(id: number): Promise<void> {
    const budget = await this.findOne(id);
    if (budget.isOthers) {
      throw new BadRequestException('The Others budget cannot be deleted');
    }
    await this.budgetModel.deleteOne({ id }).exec();
  }

  private async ensureOthers(): Promise<void> {
    const existing = await this.budgetModel.findOne({ isOthers: true }).exec();
    if (existing) return;
    await new this.budgetModel({
      id: generateId(),
      category: null,
      limit: 0,
      icon: 'bag',
      isOthers: true,
    }).save();
  }

  private async assertUniqueCategory(
    category: string,
    exceptId?: number,
  ): Promise<void> {
    const named = await this.budgetModel.find({ isOthers: false }).exec();
    const taken = named.some(
      (budget) =>
        budget.id !== exceptId &&
        budget.category != null &&
        this.sameCategory(budget.category, category),
    );
    if (taken) {
      throw new BadRequestException(
        'A budget for this category already exists',
      );
    }
  }

  private assertCategory(category: string | null | undefined): string {
    const name = category?.trim() ?? '';
    if (!name) throw new BadRequestException('Category is required');
    if (this.sameCategory(name, 'Others')) {
      throw new BadRequestException('Others is reserved');
    }
    return name;
  }

  private assertIcon(icon: string): BudgetIconName {
    if ((BUDGET_ICONS as readonly string[]).includes(icon)) {
      return icon as BudgetIconName;
    }
    throw new BadRequestException('Unknown budget icon');
  }

  private assertLimit(limit: number, allowZero: boolean): number {
    if (typeof limit !== 'number' || Number.isNaN(limit)) {
      throw new BadRequestException('Limit is required');
    }
    if (allowZero ? limit < 0 : !(limit > 0)) {
      throw new BadRequestException(
        allowZero
          ? 'Limit cannot be negative'
          : 'Limit must be greater than 0',
      );
    }
    if (!/^\d+(\.\d{1,2})?$/.test(String(limit))) {
      throw new BadRequestException(
        'Limit cannot have more than 2 decimal places',
      );
    }
    return limit;
  }

  private sameCategory(left: string, right: string): boolean {
    return left.trim().toLowerCase() === right.trim().toLowerCase();
  }
}
