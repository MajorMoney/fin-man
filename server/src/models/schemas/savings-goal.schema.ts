import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SavingsGoalDocument = SavingsGoal & Document;

/**
 * A savings goal is not an account and is not linked to one.
 * Dates are calendar dates (YYYY-MM-DD) and amounts are EUR.
 */
@Schema()
export class SavingsGoal {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true })
  targetAmount!: number;

  @Prop({ required: true })
  targetDate!: string;

  /** Calendar day the goal was created. */
  @Prop({ required: true })
  createdOn!: string;

  /** Target amount when the goal was created. Editing the goal does not change it. */
  @Prop({ required: true })
  paceTargetAmount!: number;

  /** Target date when the goal was created. Editing the goal does not change it. */
  @Prop({ required: true })
  paceTargetDate!: string;
}

export const SavingsGoalSchema = SchemaFactory.createForClass(SavingsGoal);
