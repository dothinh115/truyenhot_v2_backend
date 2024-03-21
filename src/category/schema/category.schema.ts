import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import mongoose, { HydratedDocument } from 'mongoose';
import autoSlug from '@/core/mongoose/plugins/auto-slug.plugin';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ type: mongoose.Schema.Types.Number, input: 'number', disabled: true })
  _id: number;
  @Prop({
    required: true,
    trim: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
  })
  title: string;
  @Prop({ type: mongoose.Schema.Types.String, input: 'text', disabled: true })
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.plugin(AutoIncrementID);

CategorySchema.plugin(autoSlug);
