import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument } from 'mongoose';
import autoSlug from 'src/mongoose/plugin/auto-slug.plugin';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema()
export class Chapter {
  @Prop()
  _id: number;
  @Prop({ required: true, ref: 'Story' })
  story: number;
  @Prop({ required: true, trim: true })
  name: string;
  @Prop({ default: null, trim: true })
  title: string;
  @Prop({ required: true, trim: true })
  content: string;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.plugin(AutoIncrementID, { startAt: 1 });

ChapterSchema.plugin(autoSlug('name'));
