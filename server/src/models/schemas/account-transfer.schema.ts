import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountTransferDocument = AccountTransfer & Document;

@Schema()
export class AccountTransfer {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  fromAccountId!: number;

  @Prop({ required: true })
  toAccountId!: number;

  @Prop({ required: true })
  fromAccount!: string;

  @Prop({ required: true })
  toAccount!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  date!: string;

  @Prop({ default: '' })
  notes!: string;

  @Prop({ required: true, default: 'EUR' })
  currency!: string;
}

export const AccountTransferSchema = SchemaFactory.createForClass(AccountTransfer);
