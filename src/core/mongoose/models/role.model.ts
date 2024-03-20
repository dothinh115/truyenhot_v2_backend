import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRole {
  @Prop({ auto: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop()
  slug: string;
}
