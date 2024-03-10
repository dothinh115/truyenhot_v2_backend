import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument } from 'mongoose';
import autoSlug from 'src/core/mongoose/plugins/auto-slug.plugin';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop()
  _id: number;
  @Prop({ required: true, trim: true })
  title: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.plugin(AutoIncrementID);

CategorySchema.plugin(autoSlug);
