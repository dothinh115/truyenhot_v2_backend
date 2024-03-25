import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import mongoose, { HydratedDocument } from 'mongoose';
import autoSlug from '@/core/mongoose/plugins/auto-slug.plugin';

export type StatusDocument = HydratedDocument<Status>;

@Schema()
export class Status {
  @Prop({ type: mongoose.Schema.Types.Number, disabled: true })
  _id: number;
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  title: string;
}

export const StatusSchema = SchemaFactory.createForClass(Status);

StatusSchema.plugin(AutoIncrementID, { startAt: 1 });

StatusSchema.plugin(autoSlug);
