import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  holdings!: number;

  @Prop({ required: true })
  holders!: string[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
