import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument } from 'mongoose';
import autoSlug from 'src/mongoose/plugin/auto-slug.plugin';

export type StoryDocument = HydratedDocument<Story>;

@Schema()
export class Story {
  @Prop()
  _id: number;
  @Prop({ required: true, trim: true })
  title: string;
  @Prop({ required: 'true', ref: 'Category' })
  category: string[];
  @Prop({ required: true, ref: 'Author' })
  author: number;
  @Prop({ default: 2, ref: 'Status' })
  status: number;
  @Prop({ default: null, trim: true })
  description: string;
  @Prop({ default: 0 })
  view: number;
  @Prop({ default: null, trim: true })
  cover: string;
  @Prop({ default: 'Sưu tầm', trim: true })
  source: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);

StorySchema.plugin(AutoIncrementID, { startAt: 1 });

StorySchema.plugin(autoSlug);
