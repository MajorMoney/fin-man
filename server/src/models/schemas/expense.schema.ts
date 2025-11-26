import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExpenseDocument = Expense & Document;

@Schema()
export class Expense {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop()
  currency?: string;

  @Prop()
  account?: string;

  @Prop({ required: true })
  category!: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  user!: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
