import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import mongoose, { HydratedDocument } from 'mongoose';
import autoSlug from '@/core/mongoose/plugins/auto-slug.plugin';

export type AuthorDocument = HydratedDocument<Author>;

@Schema()
export class Author {
  @Prop({ input: 'number', disabled: true, type: mongoose.Schema.Types.Number })
  _id: number;
  @Prop({ required: true, input: 'text', type: mongoose.Schema.Types.String })
  name: string;
  @Prop({ input: 'text', disabled: true, type: mongoose.Schema.Types.String })
  slug: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.plugin(AutoIncrementID, { startAt: 1 });

AuthorSchema.plugin(autoSlug, { field: 'name' });
