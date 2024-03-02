import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument, PromiseProvider } from 'mongoose';
import autoSlug from 'src/mongoose/plugin/auto-slug.plugin';

export type StatusDocument = HydratedDocument<Status>;

@Schema()
export class Status {
  @Prop()
  _id: number;
  @Prop({ required: true })
  title: string;
}

export const StatusSchema = SchemaFactory.createForClass(Status);

StatusSchema.plugin(AutoIncrementID, { startAt: 1 });

StatusSchema.plugin(autoSlug('title'));
