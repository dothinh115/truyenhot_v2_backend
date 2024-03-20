import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFolder {
  @Prop({ auto: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop({ unique: true })
  slug: string;
}
