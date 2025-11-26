import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, discriminatorKey: 'type' })
export class Transaction {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  type!: 'income' | 'expense'; // ✅ Add type here

  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  account!: string;

  @Prop({ required: true })
  category!: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  user!: string;

  // Recurrence
  @Prop({ default: false })
  recurring?: boolean;

  @Prop()
  recurrenceRule?: string;

  @Prop()
  endDate?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
