import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const BUDGET_ICONS = [
  'home',
  'cart',
  'car',
  'utensils',
  'heart',
  'film',
  'refresh',
  'shirt',
  'bag',
] as const;

export type BudgetIconName = (typeof BUDGET_ICONS)[number];

export type BudgetDocument = Budget & Document;

@Schema()
export class Budget {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ type: String, default: null })
  category!: string | null;

  @Prop({ required: true })
  limit!: number;

  @Prop({ required: true })
  icon!: BudgetIconName;

  @Prop({ required: true, default: false })
  isOthers!: boolean;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
