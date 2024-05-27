import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import mongoose, { HydratedDocument } from 'mongoose';
import autoSlug from '@/core/mongoose/plugins/auto-slug.plugin';

export type StoryDocument = HydratedDocument<Story>;

@Schema()
export class Story {
  @Prop({ type: mongoose.Schema.Types.Number, disabled: true })
  _id: number;
  @Prop({ type: mongoose.Schema.Types.String, disabled: true })
  slug: string;
  @Prop({
    required: true,
    trim: true,
    type: mongoose.Schema.Types.String,
  })
  title: string;
  @Prop({
    required: true,
    ref: 'Category',
    type: mongoose.Schema.Types.Array,
  })
  category: string[];
  @Prop({
    required: true,
    ref: 'Author',
    type: mongoose.Schema.Types.Number,
  })
  author: number;
  @Prop({
    required: true,
    default: 2,
    ref: 'Status',
    type: mongoose.Schema.Types.Number,
  })
  status: number;
  @Prop({
    default: null,
    trim: true,
    type: mongoose.Schema.Types.String,
    richText: true,
  })
  description: string;
  @Prop({
    default: 0,
    type: mongoose.Schema.Types.Number,
    disabled: true,
  })
  view: number;
  @Prop({
    default: null,
    trim: true,
    type: mongoose.Schema.Types.String,
  })
  cover: string;
  @Prop({
    default: 'Sưu tầm',
    trim: true,
    type: mongoose.Schema.Types.String,
  })
  source: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);

StorySchema.index({
  category: 1,
});

StorySchema.plugin(AutoIncrementID, { startAt: 1 });

StorySchema.plugin(autoSlug);
