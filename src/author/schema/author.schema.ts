import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { HydratedDocument } from 'mongoose';
import autoSlug from 'src/core/mongoose/plugin/auto-slug.plugin';

export type AuthorDocument = HydratedDocument<Author>;

@Schema()
export class Author {
  @Prop()
  _id: number;
  @Prop({ required: true })
  name: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.plugin(AutoIncrementID, { startAt: 1 });

AuthorSchema.plugin(autoSlug, { field: 'name' });
