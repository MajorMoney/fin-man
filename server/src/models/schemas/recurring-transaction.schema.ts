// src/models/schemas/recurring-transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecurringTransactionDocument = RecurringTransaction & Document;

@Schema({ timestamps: true })
export class RecurringTransaction {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  type!: 'income' | 'expense';

  @Prop({ required: true })
  startDate!: string; // ISO date string for first occurrence

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

  // Recurrence rule in RRULE string (e.g. 'FREQ=MONTHLY;BYMONTHDAY=1')
  @Prop({ required: true })
  recurrenceRule!: string;

  @Prop()
  endDate?: string; // optional ISO date string to end the recurrence

  // When we last processed/generating instances up to this date (inclusive)
  @Prop()
  lastProcessedAt?: string; // ISO date string
}

export const RecurringTransactionSchema =
  SchemaFactory.createForClass(RecurringTransaction);
