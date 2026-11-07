import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const INCIDENT_STATUSES = ['open', 'resolved'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export type IncidentDocument = Incident & Document;

@Schema()
export class Incident {
  @Prop({ required: true, unique: true })
  id!: number;

  /** What raised it, e.g. recurring-transaction. */
  @Prop({ required: true, index: true })
  source!: string;

  /** Id of that source record, when there is one. */
  @Prop({ type: Number, default: null, index: true })
  sourceId!: number | null;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({
    required: true,
    default: 'open',
    index: true,
    type: String,
    enum: INCIDENT_STATUSES,
  })
  status!: IncidentStatus;

  @Prop({ required: true })
  createdAt!: string;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
