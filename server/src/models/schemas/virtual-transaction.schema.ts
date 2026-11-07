import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VirtualTransactionDocument = VirtualTransaction & Document;

/**
 * Progress on a savings goal. Not a real transaction: it never touches
 * the transactions collection or any account balance.
 */
@Schema()
export class VirtualTransaction {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true, index: true })
  goalId!: number;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  date!: string;

  @Prop({ default: '' })
  note!: string;
}

export const VirtualTransactionSchema =
  SchemaFactory.createForClass(VirtualTransaction);
