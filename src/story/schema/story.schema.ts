import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import mongoose, { HydratedDocument } from 'mongoose';
import autoSlug from '@/core/mongoose/plugins/auto-slug.plugin';

export type StoryDocument = HydratedDocument<Story>;

@Schema()
export class Story {
  @Prop({ type: mongoose.Schema.Types.Number, input: 'number', disabled: true })
  _id: number;
  @Prop({
    required: true,
    trim: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
  })
  title: string;
  @Prop({
    required: 'true',
    ref: 'Category',
    type: mongoose.Schema.Types.Array,
    input: 'array',
  })
  category: string[];
  @Prop({
    required: true,
    ref: 'Author',
    type: mongoose.Schema.Types.Number,
    input: 'number',
  })
  author: number;
  @Prop({
    default: 2,
    ref: 'Status',
    type: mongoose.Schema.Types.Number,
    input: 'number',
  })
  status: number;
  @Prop({
    default: null,
    trim: true,
    type: mongoose.Schema.Types.String,
    input: 'richText',
  })
  description: string;
  @Prop({
    default: 0,
    type: mongoose.Schema.Types.Number,
    input: 'number',
    disabled: true,
  })
  view: number;
  @Prop({
    default: null,
    trim: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
  })
  cover: string;
  @Prop({
    default: 'Sưu tầm',
    trim: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
  })
  source: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);

StorySchema.plugin(AutoIncrementID, { startAt: 1 });

StorySchema.plugin(autoSlug);
