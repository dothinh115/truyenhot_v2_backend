import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRole {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
  })
  title: string;
  @Prop({ type: mongoose.Schema.Types.String, disabled: true })
  slug: string;
}
