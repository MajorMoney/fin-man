import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IncomeDocument = Income & Document;

@Schema()
export class Income {
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
  source?: string;

  @Prop()
  recurring?: boolean;

  @Prop()
  recurrenceRule?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  user!: string;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);