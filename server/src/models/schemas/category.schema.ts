import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  type!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
