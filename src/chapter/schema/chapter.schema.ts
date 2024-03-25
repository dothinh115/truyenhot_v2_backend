import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import mongoose, { HydratedDocument } from 'mongoose';
import autoSlug from '@/core/mongoose/plugins/auto-slug.plugin';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema()
export class Chapter {
  @Prop({ type: mongoose.Schema.Types.Number, disabled: true })
  _id: number;
  @Prop({
    required: true,
    ref: 'Story',
    type: mongoose.Schema.Types.Number,
  })
  story: number;
  @Prop({
    required: true,
    trim: true,
    type: mongoose.Schema.Types.String,
  })
  name: string;
  @Prop({
    default: null,
    trim: true,
    type: mongoose.Schema.Types.String,
  })
  title: string;
  @Prop({
    default: null,
    trim: true,
    type: mongoose.Schema.Types.String,
    richText: true,
  })
  content: string;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.plugin(AutoIncrementID, { startAt: 1 });

ChapterSchema.plugin(autoSlug, { field: 'name' });
